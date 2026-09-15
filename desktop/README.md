# Desktop apps

Menu-bar Mac app and a Windows companion. Same AFKMAXX chrome: pause, **Web Indexing** (Bright’s required label), Learn more.

## Mac

```bash
cd desktop/macos
xcodebuild -scheme AFKMAXX -configuration Debug -derivedDataPath ./DerivedData build
open DerivedData/Build/Products/Debug/AFKMAXX.app
```

This machine has Command Line Tools only, so `xcodebuild` cannot compile until full Xcode is installed. Open `desktop/macos/AFKMAXX.xcodeproj` in Xcode and press Run.

Bright SDK: drop `brdsdk.framework` and `net_updater.app` into `desktop/macos/Vendor/BrightSDK/` and follow that folder’s README. Until then the app stores consent locally and does not join Bright’s network.

## Windows

Needs .NET 8 SDK on a Windows machine:

```bat
cd desktop\windows\AFKMAXX
dotnet run -c Release
```

Bright SDK: put `lum_sdk64.dll`, `net_updater64.exe`, and a real `app_id` in `brd_config.json` next to the exe. Installer must run `net_updater64.exe --install-ui APPID` as admin (see Bright’s Windows guide).

## Store / review

Bright reviews the consent + Web Indexing + opt-out UX before payouts. Privacy copy on `/privacy` includes their required EULA links.
