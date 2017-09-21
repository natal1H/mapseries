#!/bin/bash

set -e

curl -sL https://deb.nodesource.com/setup_8.x | bash -

apt-get update
apt-get install -y \
  build-essential \
  openjdk-7-jdk \
  python \
  xsltproc \
  git \
  maven \
  pkg-config \
  libcairo2-dev \
  libjpeg-dev \
  libgif-dev \
  nodejs

npm install -g grunt-cli
npm install -g bower
npm install -g geojson-extent
npm install -g jake
npm install -g jshint
npm install -g gulp-cli
