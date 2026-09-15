import AppKit
import SwiftUI

enum Palette {
    static let ink = Color(red: 0.043, green: 0.051, blue: 0.071)
    static let mint = Color(red: 0.784, green: 1.0, blue: 0.239)
    static let paper = Color(red: 0.957, green: 0.945, blue: 0.910)
    static let muted = Color(red: 0.655, green: 0.667, blue: 0.643)
    static let line = Color(red: 0.204, green: 0.216, blue: 0.231)
    static let panel = Color(red: 0.078, green: 0.090, blue: 0.106)
    static let glassEdge = Color.white.opacity(0.22)
    static let glassFill = Color.white.opacity(0.06)

    static let display = Font.custom("Barlow", size: 42).weight(.black)
    static let displayLarge = Font.custom("Barlow", size: 64).weight(.black)
    static let body = Font.custom("DM Sans", size: 14)
    static let micro = Font.custom("DM Mono", size: 10)

    static let radius: CGFloat = 22
    static let ease = Animation.spring(response: 0.48, dampingFraction: 0.86)
}

enum Links {
    static let origin = URL(string: "http://localhost:4173")!
    static let eula = URL(string: "https://bright-sdk.com/eula")!
    static let sdkPrivacy = URL(string: "https://bright-sdk.com/privacy-policy")!
    static let learnMore = URL(string: "https://bright-sdk.com/users#learn-more-about-bright-sdk-web-indexing")!
    static let brightData = URL(string: "https://brightdata.com/")!
    static let useCases = URL(string: "https://bright-sdk.com/ethical-usage-of-residential-proxies")!
    static let dashboard = URL(string: "http://localhost:4173/app")!

    static func api(_ path: String) -> URL {
        URL(string: "http://localhost:4173\(path)")!
    }

    static func openDashboard() {
        NSWorkspace.shared.open(dashboard)
    }
}

struct PressScale: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.easeOut(duration: 0.14), value: configuration.isPressed)
    }
}

struct GlassCard<Content: View>: View {
    var padding: CGFloat = 22
    var expands = false
    @ViewBuilder var content: () -> Content

    var body: some View {
        content()
            .padding(padding)
            .frame(maxWidth: .infinity, maxHeight: expands ? .infinity : nil, alignment: .topLeading)
            .background {
                RoundedRectangle(cornerRadius: Palette.radius, style: .continuous)
                    .fill(Palette.glassFill)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: Palette.radius, style: .continuous))
            }
            .overlay {
                RoundedRectangle(cornerRadius: Palette.radius, style: .continuous)
                    .strokeBorder(
                        LinearGradient(
                            colors: [Palette.glassEdge, Color.white.opacity(0.04), Palette.mint.opacity(0.16)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            }
            .overlay(alignment: .top) {
                RoundedRectangle(cornerRadius: Palette.radius, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [Color.white.opacity(0.16), Color.clear],
                            startPoint: .top,
                            endPoint: UnitPoint(x: 0.5, y: 0.42)
                        )
                    )
                    .allowsHitTesting(false)
            }
            .shadow(color: Color.black.opacity(0.22), radius: 24, y: 12)
    }
}

struct MeshGlow: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var shift = false

    var body: some View {
        ZStack {
            Palette.ink
            Circle()
                .fill(Palette.mint.opacity(0.26))
                .frame(width: 420, height: 420)
                .blur(radius: 96)
                .offset(x: shift ? -210 : -90, y: shift ? -150 : -50)
            Circle()
                .fill(Color(red: 0.35, green: 0.46, blue: 1).opacity(0.22))
                .frame(width: 460, height: 460)
                .blur(radius: 120)
                .offset(x: shift ? 280 : 170, y: shift ? 180 : 70)
            Circle()
                .fill(Color.white.opacity(0.1))
                .frame(width: 260, height: 260)
                .blur(radius: 72)
                .offset(x: shift ? 30 : 70, y: shift ? 20 : -30)
        }
        .ignoresSafeArea()
        .onAppear {
            guard !reduceMotion else { return }
            withAnimation(.easeInOut(duration: 10).repeatForever(autoreverses: true)) {
                shift = true
            }
        }
    }
}

struct GlassWindow: NSViewRepresentable {
    func makeNSView(context: Context) -> NSView {
        let view = NSView()
        DispatchQueue.main.async { Self.apply(view) }
        return view
    }

    func updateNSView(_ nsView: NSView, context: Context) {
        DispatchQueue.main.async { Self.apply(nsView) }
    }

    private static func apply(_ view: NSView) {
        guard let window = view.window else { return }
        window.titlebarAppearsTransparent = true
        window.titleVisibility = .hidden
        window.isMovableByWindowBackground = true
        window.backgroundColor = .clear
        window.isOpaque = false
        window.styleMask.insert(.fullSizeContentView)
        window.styleMask.insert(.resizable)
        window.minSize = NSSize(width: 920, height: 580)
    }
}
