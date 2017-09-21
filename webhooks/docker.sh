#!/bin/bash

set -e

cd /build/webhooks
mvn package
cp target/mapseries-webhooks-*.war $CATALINA_HOME/webapps/webhooks.war
