#!/usr/bin/env bash
# Helper to commit all changes with a consistent message
set -euo pipefail
msg="$1"
if [ -z "$msg" ]; then
  msg="chore: update by assistant"
fi
git add -A
git commit -m "$msg"
echo "Committed: $msg"
