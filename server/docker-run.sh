#!/usr/bin/env bash

set -ex

if [ ! -f /started-flag ]; then
    SERVER=oauthdemo npm run deploy
fi
echo "First started on: $(date '+%Y-%m-%d %H:%M:%S')" > /started-flag
npm run debug