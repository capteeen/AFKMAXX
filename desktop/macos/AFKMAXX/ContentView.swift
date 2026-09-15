import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var session: Session

    var body: some View {
        ZStack {
            Palette.ink.ignoresSafeArea()
            VStack(alignment: .leading, spacing: 0) {
                header
                Divider().overlay(Palette.line)
                status
                Divider().overlay(Palette.line)
                controls
                Spacer(minLength: 16)
                footer
            }
            .padding(22)
        }
        .frame(width: 380, height: 620)
        .preferredColorScheme(.dark)
        .sheet(isPresented: $session.showConsentSheet) {
            ConsentSheet()
                .environmentObject(session)
        }
    }

    private var header: some View {
        HStack {
            Text("AFKMAXX")
                .font(Font.custom("Barlow", size: 22).weight(.black))
                .tracking(-0.4)
            Spacer()
            Text("DESKTOP")
                .font(Palette.micro)
                .tracking(1.6)
                .foregroundStyle(Palette.muted)
        }
        .padding(.bottom, 18)
    }

    private var status: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(session.indexing ? "YOUR CONNECTION / SIDE QUEST" : "YOUR CONNECTION IS TAKING A BREATHER")
                .font(Palette.micro)
                .tracking(1.4)
                .foregroundStyle(Palette.muted)
            HStack(alignment: .firstTextBaseline) {
                Text(session.statusWord)
                    .font(Palette.displayLarge)
                    .foregroundStyle(session.indexing ? Palette.mint : Palette.paper)
                Spacer()
                Text(session.indexing ? "●" : "Ⅱ")
                    .font(.system(size: 36, weight: .bold))
                    .foregroundStyle(Palette.mint)
            }
            Text(session.statusNote)
                .font(Palette.body)
                .foregroundStyle(Palette.muted)
                .fixedSize(horizontal: false, vertical: true)
            Button(action: session.togglePause) {
                HStack {
                    Text(session.paused ? "Start side quest" : "Pause")
                    Spacer()
                    Text(session.paused ? "↗" : "Ⅱ")
                }
                .font(Palette.body)
                .foregroundStyle(Palette.ink)
                .padding(.horizontal, 18)
                .padding(.vertical, 14)
                .background(Palette.mint)
            }
            .buttonStyle(.plain)
            .padding(.top, 8)
        }
        .padding(.vertical, 22)
    }

    private var controls: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("LIMITS")
                .font(Palette.micro)
                .tracking(1.6)
                .foregroundStyle(Palette.muted)
            Toggle(isOn: Binding(
                get: { session.choice == .peer },
                set: { session.setIndexing($0) }
            )) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Web Indexing")
                        .font(Palette.body)
                        .foregroundStyle(Palette.paper)
                    Text(session.choice == .peer
                         ? "When enabled you keep AFKMAXX desktop checks available."
                         : "Enable to keep AFKMAXX desktop checks available.")
                        .font(.custom("DM Sans", size: 12))
                        .foregroundStyle(Palette.muted)
                }
            }
            .toggleStyle(.switch)
            .tint(Palette.mint)

            Link("Learn more", destination: Links.learnMore)
                .font(Palette.micro)
                .tracking(1.2)
                .foregroundStyle(Palette.mint)

            if !session.liveSDK {
                Text("Bright SDK binary is not in this build yet. Consent is stored on this Mac only.")
                    .font(.custom("DM Sans", size: 12))
                    .foregroundStyle(Palette.muted)
            }
        }
        .padding(.top, 20)
    }

    private var footer: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("In return for AFKMAXX desktop features you may choose to be a peer on the Bright Data network. That uses idle CPU, GPU, and bandwidth when it will not materially affect this Mac. Pause or disable Web Indexing anytime.")
                .font(.custom("DM Sans", size: 11))
                .foregroundStyle(Palette.muted)
            HStack(spacing: 14) {
                Link("Bright EULA", destination: Links.eula)
                Link("SDK privacy", destination: Links.sdkPrivacy)
                Link("Web app", destination: Links.app)
            }
            .font(Palette.micro)
            .tracking(1.0)
            .foregroundStyle(Palette.paper)
        }
    }
}

struct ConsentSheet: View {
    @EnvironmentObject private var session: Session

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("WEB INDEXING")
                .font(Palette.micro)
                .tracking(1.6)
                .foregroundStyle(Palette.muted)
            Text("SHARE IDLE POWER.")
                .font(Palette.display)
                .foregroundStyle(Palette.paper)
            Text("AFKMAXX can use idle CPU, GPU, and bandwidth through Bright SDK, only in a way that should not materially slow this Mac. You can disable Web Indexing here at any time.")
                .font(Palette.body)
                .foregroundStyle(Palette.muted)
            Link("Learn more about Bright SDK", destination: Links.learnMore)
                .font(Palette.micro)
                .foregroundStyle(Palette.mint)
            HStack {
                Button("Not now") { session.showConsentSheet = false }
                    .buttonStyle(.plain)
                    .foregroundStyle(Palette.muted)
                Spacer()
                Button("Enable Web Indexing") { session.acceptLocalConsent() }
                    .buttonStyle(.plain)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Palette.mint)
                    .foregroundStyle(Palette.ink)
            }
            .padding(.top, 8)
        }
        .padding(24)
        .frame(width: 340)
        .background(Palette.ink)
    }
}
