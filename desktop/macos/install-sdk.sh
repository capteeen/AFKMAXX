#!/bin/sh
set -e
cd "$(dirname "$0")"

if [ -z "$SDK_API_KEY" ]; then
  cat <<'EOF'
Bright SDK is not in this repo. Get a key, then re-run:

  1. Create the Mac app at https://bright-sdk.com/cp/apps (bundle id com.afkmaxx.desktop)
  2. Settings → Company profile → API keys → copy a key
  3. export SDK_API_KEY='…'
  4. ./install-sdk.sh

Docs: https://brightsdk.github.io/bright-sdk-downloader-rs/obtain-api-key.html
EOF
  exit 1
fi

npx --yes github:BrightSDK/bright-sdk-integration \
  --platform macos \
  brd_sdk.config.json
