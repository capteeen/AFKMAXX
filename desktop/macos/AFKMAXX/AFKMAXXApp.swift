import AppKit
import CoreText
import SwiftUI

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    let session = Session()

    func applicationDidFinishLaunching(_ notification: Notification) {
        for name in ["Display", "Body", "Mono"] {
            if let url = Bundle.main.url(forResource: name, withExtension: "ttf") {
                CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
            }
        }
        // Bright SDK is started once here via Session.boot → BrightSDKClient.start.
        session.boot()
        NSApp.setActivationPolicy(.regular)
    }

    func application(_ application: NSApplication, open urls: [URL]) {
        urls.forEach { session.handleOpenURL($0) }
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        false
    }
}

@main
struct AFKMAXXApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var delegate

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(delegate.session)
                .onOpenURL { delegate.session.handleOpenURL($0) }
        }
        .windowStyle(.hiddenTitleBar)
        .windowResizability(.contentMinSize)
        .defaultSize(width: 1080, height: 700)
        .commands {
            CommandMenu("Go") {
                Button("Open Dashboard") {
                    Links.openDashboard()
                }
                .keyboardShortcut("d", modifiers: [.command])
                Button("Sign in") {
                    delegate.session.beginStart()
                }
                .keyboardShortcut("l", modifiers: [.command])
            }
        }

        MenuBarExtra("AFKMAXX", systemImage: delegate.session.indexing ? "dot.radiowaves.left.and.right" : "pause.fill") {
            Button(delegate.session.paused ? "Resume demo" : "Pause") {
                delegate.session.togglePause()
            }
            .disabled(!delegate.session.online || !delegate.session.signedIn)
            Toggle("Web Indexing", isOn: Binding(
                get: { delegate.session.choice == .peer },
                set: { delegate.session.setIndexing($0) }
            ))
            .disabled(!delegate.session.online || !delegate.session.signedIn)
            Divider()
            if delegate.session.signedIn {
                Text(delegate.session.accountEmail)
                Button("Sign out") { delegate.session.signOut() }
            } else {
                Button("Sign in") { delegate.session.beginStart() }
            }
            Button("Open dashboard") {
                Links.openDashboard()
            }
            Button("Open AFKMAXX") {
                NSApp.activate(ignoringOtherApps: true)
            }
            Button("Quit") { NSApp.terminate(nil) }
        }
    }
}
