import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var session: Session

    var body: some View {
        ZStack {
            MeshGlow()
            GlassWindow().frame(width: 0, height: 0)
            HStack(alignment: .top, spacing: 16) {
                sidebar
                main
            }
            .padding(18)
            .padding(.top, 10)
        }
        .frame(minWidth: 920, minHeight: 580)
        .preferredColorScheme(.dark)
        .sheet(isPresented: $session.showConsentSheet) {
            ConsentSheet()
                .environmentObject(session)
        }
    }

    private var sidebar: some View {
        GlassCard(padding: 22, expands: true) {
            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .firstTextBaseline) {
                    Text("AFKMAXX")
                        .font(Font.custom("Barlow", size: 24).weight(.black))
                        .tracking(-0.4)
                    Spacer()
                    Text(session.liveSDK ? "LIVE SDK" : "DEMO")
                        .font(Palette.micro)
                        .tracking(1.4)
                        .foregroundStyle(session.liveSDK ? Palette.mint : Palette.muted)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 5)
                        .background(.white.opacity(0.06), in: Capsule())
                }
                .padding(.bottom, 12)

                HStack(spacing: 8) {
                    Circle()
                        .fill(session.online ? Palette.mint : Color.orange)
                        .frame(width: 7, height: 7)
                    Text(session.online ? "ONLINE" : "NO INTERNET")
                        .font(Palette.micro)
                        .tracking(1.2)
                        .foregroundStyle(session.online ? Palette.mint : Color.orange)
                }
                .padding(.bottom, 18)

                Text("ON THIS MAC")
                    .font(Palette.micro)
                    .tracking(1.6)
                    .foregroundStyle(Palette.muted)
                    .padding(.bottom, 10)

                Text(session.statusWord)
                    .font(Font.custom("Barlow", size: 28).weight(.black))
                    .foregroundStyle(session.indexing ? Palette.mint : Palette.paper)
                    .animation(Palette.ease, value: session.statusWord)

                Text(session.indexing ? "Idle shares are being recorded." : session.statusNote)
                    .font(.custom("DM Sans", size: 13))
                    .foregroundStyle(Palette.muted)
                    .padding(.top, 6)
                    .fixedSize(horizontal: false, vertical: true)

                if session.signedIn {
                    Text(session.accountEmail)
                        .font(.custom("DM Sans", size: 12))
                        .foregroundStyle(Palette.paper)
                        .padding(.top, 12)
                    Button("Sign out") { session.signOut() }
                        .buttonStyle(.plain)
                        .font(Palette.micro)
                        .foregroundStyle(Palette.muted)
                        .padding(.top, 6)
                }

                Button(action: {
                    if session.signedIn { Links.openDashboard() }
                    else { session.beginStart() }
                }) {
                    HStack {
                        Text(session.signedIn ? "Open dashboard" : (session.signingIn ? "Waiting…" : "Sign in"))
                        Spacer()
                        Text("↗")
                    }
                    .font(Palette.body)
                    .foregroundStyle(Palette.ink)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Palette.mint, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                }
                .buttonStyle(PressScale())
                .disabled(!session.online)
                .padding(.top, 18)
                .accessibilityLabel(session.signedIn ? "Open dashboard in the web app" : "Sign in")

                Spacer(minLength: 24)

                Toggle(isOn: Binding(
                    get: { session.choice == .peer },
                    set: { session.setIndexing($0) }
                )) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Web Indexing")
                            .font(Palette.body)
                            .foregroundStyle(Palette.paper)
                        Text(session.choice == .peer
                             ? "When enabled you record idle shares for potential $AFK."
                             : "Enable to enjoy premium AFKMAXX checks.")
                            .font(.custom("DM Sans", size: 12))
                            .foregroundStyle(Palette.muted)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
                .toggleStyle(.switch)
                .tint(Palette.mint)
                .disabled(!session.online || !session.signedIn)
                .padding(.vertical, 14)

                Link("Learn more", destination: Links.learnMore)
                    .font(Palette.micro)
                    .tracking(1.1)
                    .foregroundStyle(Palette.mint)

                Spacer(minLength: 16)

                Text("Demo records simulated idle shares on this Mac. Bright Data does not see this traffic until they approve the SDK. Potential $AFK is not withdrawable.")
                    .font(.custom("DM Sans", size: 11))
                    .foregroundStyle(Palette.muted)
                    .fixedSize(horizontal: false, vertical: true)

                HStack(spacing: 14) {
                    Link("Bright EULA", destination: Links.eula)
                    Link("SDK privacy", destination: Links.sdkPrivacy)
                }
                .font(Palette.micro)
                .tracking(0.8)
                .foregroundStyle(Palette.paper)
                .padding(.top, 12)
            }
        }
        .frame(width: 268)
        .frame(maxHeight: .infinity)
    }

    private var main: some View {
        VStack(spacing: 16) {
            hero
            HStack(alignment: .top, spacing: 16) {
                statusCard
                    .frame(maxHeight: .infinity)
                receiptsCard
                    .frame(maxHeight: .infinity)
            }
            .frame(maxHeight: .infinity)
        }
        .frame(maxHeight: .infinity)
    }

    private var hero: some View {
        GlassCard(padding: 28) {
            HStack(alignment: .top, spacing: 28) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("POTENTIAL $AFK")
                        .font(Palette.micro)
                        .tracking(1.4)
                        .foregroundStyle(Palette.mint)
                    HStack(alignment: .firstTextBaseline, spacing: 12) {
                        Text(String(format: "%.2f", session.ledger.potentialAfk))
                            .font(Palette.displayLarge)
                            .foregroundStyle(Palette.paper)
                            .animation(Palette.ease, value: session.ledger.potentialAfk)
                        Text("NOT WITHDRAWABLE")
                            .font(Palette.micro)
                            .foregroundStyle(Palette.muted)
                    }
                    Text("\(session.ledger.receipts.count) recorded shares · \(kb(session.ledger.usedBytes)) / 100 MB today")
                        .font(.custom("DM Sans", size: 13))
                        .foregroundStyle(Palette.muted)
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule().fill(Color.white.opacity(0.1))
                            Capsule()
                                .fill(Palette.mint)
                                .frame(width: max(8, geo.size.width * session.ledger.capProgress))
                                .shadow(color: Palette.mint.opacity(0.45), radius: 8)
                                .animation(Palette.ease, value: session.ledger.capProgress)
                        }
                    }
                    .frame(height: 8)
                    .padding(.top, 8)
                }
                Spacer(minLength: 12)
                VStack(alignment: .trailing, spacing: 12) {
                    statusChip
                    Button(action: session.togglePause) {
                        HStack {
                            Text(session.primaryActionTitle)
                            Spacer()
                            Text(session.signedIn && !session.paused ? "Ⅱ" : "↗")
                        }
                        .font(Palette.body)
                        .foregroundStyle(Palette.ink)
                        .padding(.horizontal, 18)
                        .padding(.vertical, 14)
                        .frame(width: 220)
                        .background(Palette.mint, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    }
                    .buttonStyle(PressScale())
                    .disabled(!session.online)
                    .accessibilityLabel(session.primaryActionTitle)
                    Button(action: Links.openDashboard) {
                        HStack {
                            Text("Open dashboard")
                            Spacer()
                            Text("↗")
                        }
                        .font(Palette.body)
                        .foregroundStyle(Palette.paper)
                        .padding(.horizontal, 18)
                        .padding(.vertical, 12)
                        .frame(width: 220)
                        .background(.white.opacity(0.08), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .strokeBorder(Color.white.opacity(0.16), lineWidth: 1)
                        )
                    }
                    .buttonStyle(PressScale())
                    .accessibilityLabel("Open dashboard in the web app")
                }
            }
        }
        .frame(minHeight: 210)
    }

    private var statusChip: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(!session.online ? Color.orange : session.indexing ? Palette.mint : Palette.muted)
                .frame(width: 8, height: 8)
                .shadow(color: session.indexing ? Palette.mint.opacity(0.8) : .clear, radius: 6)
            Text(!session.online ? "OFFLINE" : session.signedIn ? (session.indexing ? "CHECKING" : "PAUSED") : "SIGN IN")
                .font(Palette.micro)
                .tracking(1.3)
                .foregroundStyle(!session.online ? Color.orange : session.indexing ? Palette.mint : Palette.muted)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(.white.opacity(0.08), in: Capsule())
        .overlay(Capsule().strokeBorder(Color.white.opacity(0.12), lineWidth: 1))
        .animation(Palette.ease, value: session.indexing)
        .animation(Palette.ease, value: session.online)
    }

    private var statusCard: some View {
        GlassCard(expands: true) {
            VStack(alignment: .leading, spacing: 10) {
                Text(session.indexing ? "YOUR CONNECTION / SIDE QUEST" : "YOUR CONNECTION IS TAKING A BREATHER")
                    .font(Palette.micro)
                    .tracking(1.4)
                    .foregroundStyle(Palette.muted)
                HStack(alignment: .firstTextBaseline) {
                    Text(session.statusWord)
                        .font(Font.custom("Barlow", size: 48).weight(.black))
                        .foregroundStyle(session.indexing ? Palette.mint : Palette.paper)
                        .animation(Palette.ease, value: session.statusWord)
                    Spacer()
                    Text(session.indexing ? "●" : "Ⅱ")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundStyle(Palette.mint)
                }
                Text(session.statusNote)
                    .font(Palette.body)
                    .foregroundStyle(Palette.muted)
                    .fixedSize(horizontal: false, vertical: true)
                if !session.authNote.isEmpty {
                    Text(session.authNote)
                        .font(.custom("DM Sans", size: 12))
                        .foregroundStyle(Palette.mint)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 0)
            }
        }
    }

    private var receiptsCard: some View {
        GlassCard(expands: true) {
            VStack(alignment: .leading, spacing: 10) {
                Text("RECORDED")
                    .font(Palette.micro)
                    .tracking(1.6)
                    .foregroundStyle(Palette.muted)
                if session.ledger.receipts.isEmpty {
                    Spacer(minLength: 8)
                    Text("No shares yet. Start the demo quest.")
                        .font(.custom("DM Sans", size: 13))
                        .foregroundStyle(Palette.muted)
                    Spacer()
                } else {
                    ScrollView {
                        VStack(spacing: 0) {
                            let rows = Array(session.ledger.receipts.prefix(12))
                            ForEach(rows) { row in
                                HStack {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(row.label)
                                            .font(.custom("DM Sans", size: 13))
                                            .foregroundStyle(Palette.paper)
                                        Text("\(kb(row.bytes)) KB · \(row.ms) ms")
                                            .font(Palette.micro)
                                            .foregroundStyle(Palette.muted)
                                    }
                                    Spacer()
                                    Text(String(format: "+%.2f", row.afk))
                                        .font(Palette.micro)
                                        .foregroundStyle(Palette.mint)
                                }
                                .padding(.vertical, 10)
                                if row.id != rows.last?.id {
                                    Divider().overlay(Color.white.opacity(0.08))
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private func kb(_ bytes: Int) -> String {
        String(format: "%.1f", Double(bytes) / 1024)
    }
}

struct ConsentSheet: View {
    @EnvironmentObject private var session: Session

    var body: some View {
        ZStack {
            MeshGlow()
            GlassCard(padding: 28) {
                VStack(alignment: .leading, spacing: 14) {
                    Text("WEB INDEXING")
                        .font(Palette.micro)
                        .tracking(1.6)
                        .foregroundStyle(Palette.muted)
                    Text("PREMIUM CHECKS ON THIS MAC.")
                        .font(Font.custom("Barlow", size: 28).weight(.black))
                        .foregroundStyle(Palette.paper)
                    ScrollView {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("To enjoy premium AFKMAXX checks, please allow Web Indexing by Bright Data to use your device's free resources and IP address to download public web data from the Internet.")
                            Text("Bright Data values your trust and takes every measure possible to protect your privacy and personal data. Bright Data does not track you.")
                            Text("Bright Data understands the security matters at stake in sharing your IP address and monitors all of its network traffic to ensure your safety.")
                            Text("Bright Data will only use your IP address for approved business-related use cases and never for unauthorized cases.")
                            Text("None of your personal information is accessed or collected except your IP address.")
                            Text("Bright Data runs in the background even after closing the application. Updates will be automatically downloaded by your device from time to time and will be subject to the EULA (End User Level Agreement).")
                            Text("Until Bright approves this build, AFKMAXX records simulated idle shares on this Mac only. No Bright network traffic yet. You can turn Web Indexing off anytime in this window.")
                        }
                        .font(Palette.body)
                        .foregroundStyle(Palette.muted)
                    }
                    VStack(alignment: .leading, spacing: 6) {
                        Link("Learn more about web indexing by Bright Data", destination: Links.learnMore)
                        Link("Learn more about Bright Data’s Privacy Policy", destination: Links.sdkPrivacy)
                        Link("Bright Data", destination: Links.brightData)
                        Link("End User License Agreement", destination: Links.eula)
                        Link("Use cases", destination: Links.useCases)
                    }
                    .font(Palette.micro)
                    .foregroundStyle(Palette.mint)
                    HStack {
                        Button("I Disagree") { session.declineLocalConsent() }
                            .buttonStyle(.plain)
                            .foregroundStyle(Palette.muted)
                        Spacer()
                        Button("I Agree") { session.acceptLocalConsent() }
                            .buttonStyle(PressScale())
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(Palette.mint, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                            .foregroundStyle(Palette.ink)
                    }
                    .padding(.top, 8)
                }
            }
            .padding(8)
        }
        .frame(width: 560, height: 620)
    }
}
