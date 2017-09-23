FROM jboss/wildfly:10.1.0.Final

COPY scripts /scripts
COPY configs /configs

USER root
RUN /scripts/setup.sh

ENV LANG en_US.utf8

# view
COPY catalog /build/catalog
RUN /build/catalog/docker.sh

# edit
COPY edit /build/edit
RUN /build/edit/docker.sh

# index
COPY index /build/index
RUN /build/index/docker.sh

RUN rm -rf /scripts /build
USER jboss

CMD ["/opt/jboss/wildfly/bin/standalone.sh", "-b", "0.0.0.0", "-c", "standalone-full-mapseries.xml"]
