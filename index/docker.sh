#!/bin/bash

set -e

cd /build/index
mvn package
cp target/index.war $JBOSS_HOME/standalone/deployments/ROOT.war
