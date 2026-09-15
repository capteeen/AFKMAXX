import Combine
import AppKit
import Foundation
import Network
import SwiftUI

@MainActor
final class Session: ObservableObject {
    @Published var choice: BrightChoice = .none
    @Published var paused = true
    @Published var liveSDK = false
    @Published var showConsentSheet = false
    @Published var ledger = DemoLedger()
    @Published var online = true
    @Published var signedIn = false
    @Published var accountEmail = ""
    @Published var signingIn = false
    @Published var authNote = ""

    let bright = BrightSDKClient()
    private var ticks: AnyCancellable?
    private var poll: AnyCancellable?
    private let monitor = NWPathMonitor()
    private let monitorQueue = DispatchQueue(label: "afkmaxx.network")
    private let tokenKey = "afkmaxx.desktop.token"

    var indexing: Bool { signedIn && online && choice == .peer && !paused && !ledger.atCap }

    var statusWord: String {
        if !online { return "OFFLINE" }
        if !signedIn { return "SIGN IN" }
        if ledger.atCap { return "CAPPED" }
        if paused { return "PAUSED" }
        if choice == .peer { return "INDEXING" }
        return "IDLE"
    }

    var statusNote: String {
        if !online {
            return "No internet. AFKMAXX waits until this Mac is online before it starts."
        }
        if !signedIn {
            return "Sign in with the same account as the web dashboard. Then you can start."
        }
        if liveSDK {
            switch choice {
            case .peer:
                return "Web Indexing is on. Bright SDK may use idle CPU and bandwidth. Pause anytime."
            case .notPeer:
                return "Web Indexing is off. Enable it to share idle resources for AFKMAXX premium checks."
            case .none:
                return "Enable Web Indexing to share idle resources. You can turn it off in this window."
            }
        }
        if indexing {
            return "Demo network. Simulated idle shares are recorded on this Mac with potential $AFK. Bright has not approved this build."
        }
        return "Signed in. Enable Web Indexing to record simulated shares and watch potential earnings stack."
    }

    var primaryActionTitle: String {
        if !online { return "Waiting for internet" }
        if !signedIn { return signingIn ? "Waiting for sign in…" : "Sign in to start" }
        return paused ? "Start demo quest" : "Pause"
    }

    func boot() {
        liveSDK = bright.isLive
        ledger.load()
        startNetworkMonitor()
        bright.onChoice = { [weak self] next in
            Task { @MainActor in
                guard let self else { return }
                self.choice = next
                if next == .peer {
                    if self.canRun { self.paused = false }
                } else {
                    self.paused = true
                }
                self.syncTicks()
            }
        }
        // Bright: initialize once in applicationDidFinishLaunching.
        bright.start()
        choice = bright.choice
        Task { await restoreAccount() }
        syncTicks()
    }

    func setIndexing(_ on: Bool) {
        guard canRun else {
            if on { beginStart() }
            return
        }
        if on {
            // Consent must reappear every time Web Indexing is turned on.
            requestConsent()
        } else {
            confirmOptOut()
        }
    }

    func requestConsent() {
        guard canRun else {
            beginStart()
            return
        }
        if liveSDK {
            bright.showConsent()
        } else {
            showConsentSheet = true
        }
    }

    func acceptLocalConsent() {
        guard canRun, !liveSDK else { return }
        bright.showConsent()
        showConsentSheet = false
        paused = false
        syncTicks()
        if ledger.receipts.isEmpty { ledger.tick() }
    }

    func declineLocalConsent() {
        bright.optOut()
        showConsentSheet = false
        paused = true
        authNote = "Web Indexing disabled. You can re-enable it anytime from this window."
        syncTicks()
    }

    func confirmOptOut() {
        let alert = NSAlert()
        alert.messageText = "Disable Web Indexing?"
        alert.informativeText = "If you disable Web Indexing, you will lose premium idle-share checks on this Mac. Continue?"
        alert.addButton(withTitle: "Disable")
        alert.addButton(withTitle: "Keep enabled")
        guard alert.runModal() == .alertFirstButtonReturn else { return }
        bright.optOut()
        paused = true
        authNote = "Web Indexing disabled. You can re-enable it anytime from this window."
        syncTicks()
    }

    func togglePause() {
        beginStart()
    }

    func beginStart() {
        if !online {
            authNote = "Connect to the internet first."
            return
        }
        if !signedIn {
            Task { await startClerkLogin() }
            return
        }
        if choice != .peer {
            requestConsent()
            return
        }
        if paused {
            paused = false
        } else {
            paused = true
        }
        syncTicks()
    }

    func signOut() {
        UserDefaults.standard.removeObject(forKey: tokenKey)
        signedIn = false
        accountEmail = ""
        paused = true
        signingIn = false
        poll?.cancel()
        authNote = "Signed out. Sign in to start again."
        syncTicks()
    }

    func handleOpenURL(_ url: URL) {
        guard url.scheme == "afkmaxx" else { return }
        NSApp.activate(ignoringOtherApps: true)
        Task { await pollLoginOnce() }
    }

    private var canRun: Bool { online && signedIn }

    private func startNetworkMonitor() {
        monitor.pathUpdateHandler = { [weak self] path in
            Task { @MainActor in
                guard let self else { return }
                let next = path.status == .satisfied
                self.online = next
                if !next {
                    self.paused = true
                    self.authNote = "Internet dropped. Checks paused."
                    self.syncTicks()
                }
            }
        }
        monitor.start(queue: monitorQueue)
    }

    private func restoreAccount() async {
        guard let token = UserDefaults.standard.string(forKey: tokenKey), !token.isEmpty else { return }
        var req = URLRequest(url: Links.api("/api/me"))
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        do {
            let (data, response) = try await URLSession.shared.data(for: req)
            guard let http = response as? HTTPURLResponse else { return }
            if http.statusCode == 401 || http.statusCode == 403 {
                UserDefaults.standard.removeObject(forKey: tokenKey)
                signedIn = false
                return
            }
            guard http.statusCode == 200 else { return }
            let payload = try JSONDecoder().decode(MeEnvelope.self, from: data)
            signedIn = true
            accountEmail = payload.user.email
            authNote = "Signed in as \(payload.user.email)."
        } catch {
            authNote = "Could not reach the web app to restore your session."
        }
    }

    private func startClerkLogin() async {
        signingIn = true
        authNote = "Opening sign in in your browser…"
        var req = URLRequest(url: Links.api("/api/desktop/session"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        do {
            let (data, response) = try await URLSession.shared.data(for: req)
            guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
                signingIn = false
                authNote = "Could not start sign in. Is the web app running?"
                return
            }
            let start = try JSONDecoder().decode(DesktopStart.self, from: data)
            UserDefaults.standard.set(start.ticket, forKey: "afkmaxx.desktop.ticket")
            NSWorkspace.shared.open(URL(string: start.loginUrl)!)
            startPolling()
        } catch {
            signingIn = false
            authNote = "Could not reach \(Links.origin.host ?? "the web app")."
        }
    }

    private func startPolling() {
        poll?.cancel()
        poll = Timer.publish(every: 1.5, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                Task { await self?.pollLoginOnce() }
            }
    }

    private func pollLoginOnce() async {
        guard let ticket = UserDefaults.standard.string(forKey: "afkmaxx.desktop.ticket") else { return }
        let req = URLRequest(url: Links.api("/api/desktop/session?ticket=\(ticket)"))
        do {
            let (data, response) = try await URLSession.shared.data(for: req)
            guard let http = response as? HTTPURLResponse else { return }
            if http.statusCode == 410 || http.statusCode == 404 {
                signingIn = false
                poll?.cancel()
                authNote = "Login link expired. Sign in again."
                return
            }
            let status = try JSONDecoder().decode(DesktopStatus.self, from: data)
            if status.status == "ready", let token = status.token, let user = status.user {
                UserDefaults.standard.set(token, forKey: tokenKey)
                UserDefaults.standard.removeObject(forKey: "afkmaxx.desktop.ticket")
                signedIn = true
                accountEmail = user.email
                signingIn = false
                poll?.cancel()
                authNote = "Signed in as \(user.email)."
            }
        } catch {
            authNote = "Waiting for sign in… keep this window open."
        }
    }

    private func syncTicks() {
        ticks?.cancel()
        guard indexing else { return }
        ticks = Timer.publish(every: 7, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                guard let self, self.indexing else { return }
                self.ledger.tick()
                self.objectWillChange.send()
                if self.ledger.atCap {
                    self.paused = true
                    self.syncTicks()
                }
            }
    }
}

private struct DesktopStart: Decodable {
    var ticket: String
    var loginUrl: String
}

private struct DesktopStatus: Decodable {
    var status: String
    var token: String?
    var user: DesktopUser?
}

private struct DesktopUser: Decodable {
    var id: String
    var email: String
}

private struct MeEnvelope: Decodable {
    var user: DesktopUser
}
