Drop the partner zip from Bright here (not committed):

- brdsdk.framework
- net_updater.app
- net_updater.entitlements
- resign_net_updater.sh

Then in Xcode:

1. Target → General → Frameworks, Libraries, and Embedded Content → add brdsdk.framework (Embed & Sign).
2. Build Phases → Copy Files → Destination: Wrapper, Subpath: Contents/Library/LoginItems → add net_updater.app.
3. Add a Run Script phase that runs resign_net_updater.sh (from Bright’s zip).
4. Rebuild. `canImport(brdsdk)` turns on and the app uses their consent dialog instead of the local sheet.

Apply at https://brightdata.com/sdk/cp/dashboard?cp_signup=1 — Bright does not publish this framework on npm.
