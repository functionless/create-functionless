#!/usr/bin/env bash

set -ue pipefail

ORIGINAL_DIRECTORY="$(pwd)"
PACKAGE_NAME="create-functionless"
PACKED_NAME="${PACKAGE_NAME}.tgz"
TEST_PROJECT="test-project"

function cleanup() {
  cd $ORIGINAL_DIRECTORY
  yarn global remove create-functionless || true
  rm -fr ${PACKED_NAME} || true
  rm -fr ${TEST_PROJECT} || true
}

trap cleanup EXIT

npm run release
npm pack
mv ${PACKAGE_NAME}*.tgz ${PACKED_NAME}
npm i -g ${PACKED_NAME}

# Use the create script to create a new project
create-functionless ${TEST_PROJECT}
cd ${TEST_PROJECT}

# Verify new project can synth
npm run synth