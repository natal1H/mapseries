#!/bin/bash

set -e

MAVEN_URL=http://mirror.hosting90.cz/apache/maven/maven-3/3.5.2/binaries/apache-maven-3.5.2-bin.tar.gz
MAVEN_ARCHIVE_FILE=maven.tar.gz
MAVEN_LOCATION=/opt

curl -sL https://rpm.nodesource.com/setup_9.x | bash -

yum update -y

yum install -y \
  nodejs \
  git \
  wget

yum clean all

wget -q -O $MAVEN_LOCATION/$MAVEN_ARCHIVE_FILE $MAVEN_URL
cd $MAVEN_LOCATION
tar -xvf $MAVEN_ARCHIVE_FILE
ln -s $MAVEN_LOCATION/apache-maven-*/bin/mvn /usr/bin/mvn

npm install -g gulp-cli

mkdir -p $JBOSS_HOME/modules/org/postgresql/main
cp /configs/postgres/* $JBOSS_HOME/modules/org/postgresql/main
cp /configs/standalone-full-mapseries.xml $JBOSS_HOME/standalone/configuration
