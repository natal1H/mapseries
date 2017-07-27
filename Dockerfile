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
ENV NODE_VERSION 6.11.0

RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/versions/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# INSTALL javascript tools
RUN npm install -g npm@latest && \
    npm install -g grunt-cli && \
    npm install -g bower && \
    npm install -g geojson-extent && \
    npm install -g jake && \
    npm install -g jshint && \
    npm install -g gulp-cli

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
RUN cp -r lib $CATALINA_HOME/webapps/ROOT

# DEPLOY edit
COPY edit /build/edit
WORKDIR /build/edit
RUN npm install
RUN gulp
RUN mkdir $CATALINA_HOME/webapps/edit
RUN cp -r * $CATALINA_HOME/webapps/edit
