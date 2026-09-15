#!/bin/sh
# Copies partner binaries into the app when they exist. No-op until
# install-sdk.sh (or a dashboard zip) drops files in Vendor/BrightSDK.
set -e

SDK_DIR="${PROJECT_DIR}/Vendor/BrightSDK"
DEST_FW="${BUILT_PRODUCTS_DIR}/${FRAMEWORKS_FOLDER_PATH}"
DEST_LOGIN="${BUILT_PRODUCTS_DIR}/${WRAPPER_NAME}/Contents/Library/LoginItems"

if [ -d "${SDK_DIR}/brdsdk.framework" ]; then
  mkdir -p "${DEST_FW}"
  rsync -a "${SDK_DIR}/brdsdk.framework" "${DEST_FW}/"
fi

if [ -d "${SDK_DIR}/net_updater.app" ]; then
  mkdir -p "${DEST_LOGIN}"
  rsync -a "${SDK_DIR}/net_updater.app" "${DEST_LOGIN}/"
fi

if [ -f "${SDK_DIR}/resign_net_updater.sh" ]; then
  /bin/sh "${SDK_DIR}/resign_net_updater.sh"
fi
