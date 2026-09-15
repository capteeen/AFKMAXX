import Foundation

enum BrightChoice: String {
    case none
    case peer
    case notPeer
}

/// Bright SDK for macOS (`import brdsdk`, `brd_api`).
/// Initialize once from AppDelegate. There is no silent opt-in: only
/// `show_consent` (user agrees) or `opt_out`.
///
/// `brdsdk.framework` is not in git. Run `desktop/macos/install-sdk.sh`
/// after exporting `SDK_API_KEY`, then rebuild. Until then this file
/// compiles against a local consent store.
#if canImport(brdsdk)
import brdsdk

@MainActor
final class BrightSDKClient {
    private var sdk: brd_api?
    var onChoice: ((BrightChoice) -> Void)?

    var isLive: Bool { true }

    var choice: BrightChoice {
        map(sdk?.choice)
    }

    func start() {
        guard sdk == nil else { return }
        do {
            sdk = try brd_api(
                app_name: "AFKMAXX",
                benefit_txt: "enjoy premium AFKMAXX checks",
                campaign: nil,
                on_choice_change: { [weak self] next in
                    self?.onChoice?(self?.map(next) ?? .none)
                }
            )
        } catch {
            NSLog("Bright SDK init failed: \(error.localizedDescription)")
        }
    }

    func showConsent() {
        sdk?.show_consent(force: true, on_choice: { [weak self] next in
            self?.onChoice?(self?.map(next) ?? .none)
        })
    }

    func optOut() {
        sdk?.opt_out()
        onChoice?(.notPeer)
    }

    private func map(_ value: Choice?) -> BrightChoice {
        switch value {
        case .peer: return .peer
        case .notPeer: return .notPeer
        default: return .none
        }
    }
}

#else

@MainActor
final class BrightSDKClient {
    private let defaults = UserDefaults.standard
    private let key = "afkmaxx.bright.choice"
    var onChoice: ((BrightChoice) -> Void)?

    var isLive: Bool { false }

    var choice: BrightChoice {
        BrightChoice(rawValue: defaults.string(forKey: key) ?? "") ?? .none
    }

    func start() {}

    /// Local demo only. Call after the user agrees on our consent sheet.
    func showConsent() {
        set(.peer)
    }

    func optOut() {
        set(.notPeer)
    }

    private func set(_ value: BrightChoice) {
        defaults.set(value.rawValue, forKey: key)
        onChoice?(value)
    }
}

#endif
