#!/bin/sh

set -e

echo "##### Running tests #####"

aptos move test \
  --dev --skip-fetch-latest-git-deps
