import Foundation
import SwiftUI

@MainActor
final class Session: ObservableObject {
    @Published var choice: BrightChoice = .none
    @Published var paused = true
    @Published var liveSDK = false
    @Published var showConsentSheet = false

    let bright = BrightSDKClient()

    var indexing: Bool { choice == .peer && !paused }

    var statusWord: String {
        if paused { return "PAUSED" }
        if choice == .peer { return "INDEXING" }
        return "IDLE"
    }

    var statusNote: String {
        if !liveSDK {
            return "App is ready. Drop brdsdk.framework from Bright into Vendor/BrightSDK, then rebuild, to join their network."
        }
        switch choice {
        case .peer:
            return "Web Indexing is on. Bright SDK may use idle CPU and bandwidth. Pause anytime."
        case .notPeer:
            return "Web Indexing is off. Enable it to share idle resources for AFKMAXX premium checks."
        case .none:
            return "Enable Web Indexing to share idle resources. You can turn it off in this window."
        }
    }

    func boot() {
        liveSDK = bright.isLive
        bright.onChoice = { [weak self] next in
            Task { @MainActor in
                self?.choice = next
                if next != .peer { self?.paused = true }
            }
        }
        bright.start()
        choice = bright.choice
        if choice == .none && bright.isLive {
            bright.showConsent()
        }
    }

    func setIndexing(_ on: Bool) {
        if on {
            requestConsent()
        } else {
            bright.optOut()
            paused = true
        }
    }

    func requestConsent() {
        if liveSDK {
            bright.showConsent()
            paused = false
        } else {
            showConsentSheet = true
        }
    }

    func acceptLocalConsent() {
        bright.showConsent()
        showConsentSheet = false
        paused = false
    }

    func togglePause() {
        if choice != .peer {
            requestConsent()
            return
        }
        paused.toggle()
    }
}
