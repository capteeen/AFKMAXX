import AppKit
import CoreText
import SwiftUI

final class AppDelegate: NSObject, NSApplicationDelegate {
    let session = Session()

    func applicationDidFinishLaunching(_ notification: Notification) {
        for name in ["Display", "Body", "Mono"] {
            if let url = Bundle.main.url(forResource: name, withExtension: "ttf") {
                CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
            }
        }
        session.boot()
        NSApp.setActivationPolicy(.regular)
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
        }
        .windowStyle(.hiddenTitleBar)
        .windowResizability(.contentSize)
        .defaultSize(width: 380, height: 620)

        MenuBarExtra("AFKMAXX", systemImage: delegate.session.indexing ? "dot.radiowaves.left.and.right" : "pause.fill") {
            Button(delegate.session.paused ? "Resume" : "Pause") {
                delegate.session.togglePause()
            }
            Toggle("Web Indexing", isOn: Binding(
                get: { delegate.session.choice == .peer },
                set: { delegate.session.setIndexing($0) }
            ))
            Divider()
            Button("Open AFKMAXX") {
                NSApp.activate(ignoringOtherApps: true)
            }
            Button("Quit") { NSApp.terminate(nil) }
        }
    }
}
