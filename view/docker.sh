#!/bin/bash

set -e

cd /build/view
npm install
bower --allow-root install
grunt install
grunt build
rm -rf $CATALINA_HOME/webapps/ROOT
mkdir $CATALINA_HOME/webapps/ROOT
cp -r client/public/* $CATALINA_HOME/webapps/ROOT
cp -r lib $CATALINA_HOME/webapps/ROOT

# clean up after yourself
cd /
rm -rf /build/view
