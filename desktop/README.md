# Desktop apps

Menu-bar Mac app and a Windows companion. Same AFKMAXX chrome: pause, **Web Indexing** (Bright’s required label), Learn more.

## Mac

```bash
cd desktop/macos
xcodebuild -scheme AFKMAXX -configuration Debug -derivedDataPath ./DerivedData build
open DerivedData/Build/Products/Debug/AFKMAXX.app
```

### Bright SDK

App Sandbox is off. The SDK will not run if sandbox is enabled.

1. Create the Mac app ID at [the Bright dashboard](https://bright-sdk.com/cp/apps). Bundle id is `com.afkmaxx.desktop`.
2. Copy an API key from Settings → Company profile → API keys.
3. Install the partner binaries (recommended CLI):

```bash
cd desktop/macos
export SDK_API_KEY='…'
chmod +x install-sdk.sh update-sdk.sh scripts/*.sh
./install-sdk.sh
```

Or unzip the dashboard SDK into `desktop/macos/Vendor/BrightSDK/` so `brdsdk.framework` and `net_updater.app` sit there.

4. Rebuild. After **I Agree** on a real Mac (not a simulator):

```bash
./scripts/verify-sdk.sh
```

You should see `net_updater` from inside `AFKMAXX.app`, and a `cid` file under `~/Library/Group Containers/<team_id>.com.brdsdk.shared`.

5. Update later with `./update-sdk.sh`.
6. Submit the build from the dashboard (Implementation self-check on a real device, then Submit for Review). Bright reviews each app up to 3 times.

Until the framework is present the app stores consent locally and does not join Bright’s network. Privacy copy on `/privacy` includes their required EULA and opt-out text.

## Windows

Needs .NET 8 SDK on a Windows machine:

```bat
cd desktop\windows\AFKMAXX
dotnet run -c Release
```

Bright SDK: put `lum_sdk64.dll`, `net_updater64.exe`, and a real `app_id` in `brd_config.json` next to the exe. Installer must run `net_updater64.exe --install-ui APPID` as admin (see Bright’s Windows guide).
