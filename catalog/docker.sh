#!/bin/bash

set -e

TARGET_DIR=$JBOSS_HOME/static

cd /build/catalog
npm install
gulp
mkdir -p $TARGET_DIR/catalog
cp -r dist/* $TARGET_DIR/catalog

# clean up after yourself
cd /
rm -rf /build/catalog
