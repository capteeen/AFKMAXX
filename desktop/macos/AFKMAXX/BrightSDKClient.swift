import Foundation

enum BrightChoice: String {
    case none
    case peer
    case notPeer
}

/// Matches Bright SDK’s macOS surface (`import brdsdk`, `brd_api`).
/// When `brdsdk.framework` is linked, this file uses it. Otherwise a local
/// consent store compiles so the app still runs while you wait for partner files.
#if canImport(brdsdk)
import brdsdk

final class BrightSDKClient {
    private var sdk: brd_api?
    var onChoice: ((BrightChoice) -> Void)?

    var isLive: Bool { true }

    var choice: BrightChoice {
        map(sdk?.choice)
    }

    func start() {
        do {
            sdk = try brd_api(campaign: nil, on_choice_change: { [weak self] next in
                self?.onChoice?(self?.map(next) ?? .none)
            })
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

    private func map(_ value: brd_choice?) -> BrightChoice {
        switch value {
        case .peer: return .peer
        case .notPeer: return .notPeer
        default: return .none
        }
    }
}

#else

final class BrightSDKClient {
    private let defaults = UserDefaults.standard
    private let key = "afkmaxx.bright.choice"
    var onChoice: ((BrightChoice) -> Void)?

    var isLive: Bool { false }

    var choice: BrightChoice {
        BrightChoice(rawValue: defaults.string(forKey: key) ?? "") ?? .none
    }

    func start() {}

    func showConsent() {
        // Partner binary not present: keep local choice until brdsdk.framework is dropped in.
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
