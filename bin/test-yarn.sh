#/usr/bin/env bash

set -ue pipefail

PACKAGE_NAME="create-functionless"
PACKED_NAME="${PACKAGE_NAME}.tgz"
WORK_DIR=`mktemp -d`

if [[ ! "$WORK_DIR" || ! -d "$WORK_DIR" ]]; then
  echo "Could not create temp dir"
  exit 1
fi

function cleanup {
  yarn global remove create-functionless || true
  rm -rf "$WORK_DIR"
  echo "Deleted temp working directory $WORK_DIR"
}

trap cleanup EXIT

# Clean up installs of create-functionless if they exist
yarn cache clean

yarn run release
yarn pack -f ${PACKED_NAME}
yarn global add --skip-integrity-check --offline "file:$(pwd)/${PACKED_NAME}"
rm ${PACKED_NAME}

cd $WORK_DIR

# Use the create script to create a new project
yarn create --offline functionless test-project
cd test-project

# Verify new project can synth
yarn synth