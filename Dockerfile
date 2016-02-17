FROM tomcat:8.0

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# INSTALL packages
RUN apt-get update && \
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
      libgif-dev

# INSTALL nvm
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 0.10.40

RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.26.1/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/v$NODE_VERSION/bin:$PATH

# INSTALL javascript tools
RUN npm install -g grunt-cli
RUN npm install -g bower
RUN npm install -g geojson-extent
RUN npm install -g jake
RUN npm install -g jshint

# DEPLOY Geoserver
COPY geoserver/geoserver.war /
RUN cp /geoserver.war $CATALINA_HOME/webapps

# DEPLOY github-proxy
COPY github-proxy/src /build/github-proxy/src
COPY github-proxy/pom.xml /build/github-proxy/pom.xml
WORKDIR /build/github-proxy
RUN mvn package
RUN cp target/github-proxy-*.war $CATALINA_HOME/webapps/github-proxy.war

# DEPLOY webhooks
COPY webhooks/src /build/webhooks/src
COPY webhooks/pom.xml /build/webhooks/pom.xml
WORKDIR /build/webhooks
RUN mvn package
RUN cp target/mapseries-webhooks-*.war $CATALINA_HOME/webapps/webhooks.war

# CONFIG webhooks
COPY configs/webhooks.conf /etc/mapseries/webhooks.conf
COPY configs/polygon.sld /data/geoserver/polygon.sld
ENV ENABLE_JSONP true

# DEPLOY view
COPY view /build/view
WORKDIR /build/view
RUN npm install
RUN bower --allow-root install
RUN grunt install
RUN grunt build
RUN rm -rf $CATALINA_HOME/webapps/ROOT
RUN mkdir $CATALINA_HOME/webapps/ROOT
RUN cp -r client/public/* $CATALINA_HOME/webapps/ROOT

# DEPLOY edit
COPY edit /build/edit
WORKDIR /build/edit
RUN wget https://raw.githubusercontent.com/handsontable/handsontable/0.22.0/dist/handsontable.full.min.js -O lib/handsontable.full.js
RUN wget https://raw.githubusercontent.com/handsontable/handsontable/0.22.0/dist/handsontable.full.min.css -O css/handsontable.full.css
RUN npm link local_packages/github-api
RUN npm install
RUN make
RUN mkdir $CATALINA_HOME/webapps/edit
RUN cp -r * $CATALINA_HOME/webapps/edit
