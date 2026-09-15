Drop the partner zip from the Bright dashboard here, or run `../install-sdk.sh` from `desktop/macos` after exporting `SDK_API_KEY`. Expected files (not committed):

- brdsdk.framework
- net_updater.app
- net_updater.entitlements
- resign_net_updater.sh

The Xcode project already:

- Disables App Sandbox (required — Bright SDK will not run sandboxed)
- Sets `ENABLE_USER_SCRIPT_SANDBOXING = NO`
- Sets `NET_UPDATER_ENTITLEMENTS` and `FRAMEWORK_SEARCH_PATHS`
- Copies `net_updater.app` into `Contents/Library/LoginItems` and re-signs it when those files exist
- Initializes `brd_api` once in AppDelegate, shows consent on every Web Indexing ON, calls `opt_out()` on OFF

Until `brdsdk.framework` is linked, `canImport(brdsdk)` is false and the app uses a local consent sheet with Bright’s required copy.
