#!/bin/bash

set -e

cd /build/github-proxy
mvn package
cp target/github-proxy-*.war $CATALINA_HOME/webapps/github-proxy.war
