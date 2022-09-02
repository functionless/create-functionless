#/usr/bin/env bash

set -ue pipefail

PACKAGE_NAME="create-functionless"
PACKED_NAME="${PACKAGE_NAME}.tgz"
TEST_PROJECT="test-project"

function cleanup {
  yarn global remove create-functionless || true
  rm -fr ${PACKED_NAME} || true
  rm -fr ${TEST_PROJECT} || true
}

trap cleanup EXIT

# Clean up installs of create-functionless if they exist
yarn cache clean

yarn run release
yarn pack -f ${PACKED_NAME}
yarn global add --skip-integrity-check --offline "file:$(pwd)/${PACKED_NAME}"

# Use the create script to create a new project
yarn create --offline functionless ${TEST_PROJECT}
cd ${TEST_PROJECT}

# Verify new project can synth
yarn synth

cd ..