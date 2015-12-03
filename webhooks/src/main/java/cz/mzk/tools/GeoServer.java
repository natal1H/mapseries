package cz.mzk.tools;

import it.geosolutions.geoserver.rest.GeoServerRESTManager;
import it.geosolutions.geoserver.rest.GeoServerRESTPublisher;
import it.geosolutions.geoserver.rest.encoder.GSLayerEncoder;
import it.geosolutions.geoserver.rest.encoder.datastore.GSAbstractDatastoreEncoder;
import it.geosolutions.geoserver.rest.encoder.datastore.GSShapefileDatastoreEncoder;
import it.geosolutions.geoserver.rest.encoder.feature.GSFeatureTypeEncoder;
import it.geosolutions.geoserver.rest.manager.GeoServerRESTStoreManager;
import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.*;

public class GeoServer {

    private static final Logger logger = LoggerFactory.getLogger(GeoServer.class);

    private static final Settings settings = Settings.getInstance();

    private static final String username = System.getenv("GEOSERVER_USERNAME");
    private static final String password = System.getenv("GEOSERVER_PASSWORD");
    private static final String workspace = settings.getGeoServerWorkspace();
    private static final String styleName = settings.getStyleName();
    private static final String styleFile = settings.getStyleFile();

    public static void registerShapefiles() {

        try {
            URL url = new URL(settings.getGeoServerUrl());

            GeoServerRESTManager manager = new GeoServerRESTManager(url, username, password);

            for (String shapeFile : getListOfShapeFiles()) {
                createStore(shapeFile, manager, workspace);
                createLayer(shapeFile, manager, workspace);
            }
        } catch (MalformedURLException e) {
            logger.error("Malformed url", e);
        }
    }

    public static void clear() {

        try {
            URL url = new URL(settings.getGeoServerUrl());

            GeoServerRESTManager manager = new GeoServerRESTManager(url, username, password);

            clear(manager, workspace, styleName, styleFile);
        } catch (MalformedURLException e) {
            logger.error("Malformed url", e);
        }
    }

    public static void createWorkspace() {

        try {
            URL url = new URL(settings.getGeoServerUrl());

            GeoServerRESTManager manager = new GeoServerRESTManager(url, username, password);
            GeoServerRESTPublisher publisher = manager.getPublisher();
            publisher.createWorkspace(workspace);
            publisher.updateStyle(new File(styleFile), styleName);
        } catch (MalformedURLException e) {
            logger.error("Malformed url", e);
        }
    }

    private static void clear(GeoServerRESTManager manager, String workspace, String styleName, String styleFile) {
        GeoServerRESTPublisher publisher = manager.getPublisher();
        publisher.removeWorkspace(workspace, true);
        publisher.createWorkspace(workspace);
        publisher.updateStyle(new File(styleFile), styleName);
    }

    private static List<String> getListOfShapeFiles() {
        File shpDir = new File(settings.getGeoServerDataDir(), settings.getGeoServerWorkspace());
        Set<String> set = new HashSet<String>();

        for (File shp : shpDir.listFiles()) {
            set.add(FilenameUtils.getBaseName(shp.getName()));
        }

        return Collections.list(Collections.enumeration(set));
    }

    private static GSAbstractDatastoreEncoder getDataStoreEncoder(String shapeFile) throws MalformedURLException {
        File shpDir = new File(settings.getGeoServerDataDir(), settings.getGeoServerWorkspace());
        File shpFile = new File(shpDir, shapeFile + ".shp");
        GSShapefileDatastoreEncoder datastore = new GSShapefileDatastoreEncoder(shapeFile, shpFile.toURI().toURL());
        datastore.setCharset(Charset.forName("UTF-8"));
        return datastore;
    }

    private static void createStore(String shapeFile, GeoServerRESTManager manager, String workspace) throws MalformedURLException {
        GSAbstractDatastoreEncoder datastore = getDataStoreEncoder(shapeFile);
        GeoServerRESTStoreManager storeManager = manager.getStoreManager();
        storeManager.create(workspace, datastore);
    }

    private static void createLayer(String shapeFile, GeoServerRESTManager manager, String workspace) {
        GSFeatureTypeEncoder featureTypeEncoder = new GSFeatureTypeEncoder();
        featureTypeEncoder.setName(shapeFile);
        GSLayerEncoder layerEncoder = new GSLayerEncoder();
        GeoServerRESTPublisher publisher = manager.getPublisher();
        publisher.publishDBLayer(workspace, shapeFile, featureTypeEncoder, layerEncoder);
    }
}
