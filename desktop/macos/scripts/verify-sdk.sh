#!/bin/sh
# After Agree on a real-device build with brdsdk.framework linked:
#   1. ps should show net_updater from inside AFKMAXX.app
#   2. Group Containers should contain a cid file for this bundle id
echo "net_updater processes:"
ps -ef | grep '[n]et_' || true
echo
echo "Bright shared group containers:"
ls -d "${HOME}/Library/Group Containers/"*.com.brdsdk.shared 2>/dev/null || echo "(none yet — SDK not connected)"
echo
echo "Look for a cid file matching com.afkmaxx.desktop in those folders."
