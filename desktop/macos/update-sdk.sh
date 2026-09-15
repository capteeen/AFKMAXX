#!/bin/sh
set -e
cd "$(dirname "$0")"

if [ -z "$SDK_API_KEY" ]; then
  echo "export SDK_API_KEY first, then re-run."
  exit 1
fi

npx --yes github:BrightSDK/bright-sdk-integration \
  --platform macos \
  --update \
  --dir . \
  brd_sdk.config.json
