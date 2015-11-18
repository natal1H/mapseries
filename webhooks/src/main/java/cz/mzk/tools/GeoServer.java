package cz.mzk.tools;

import cz.mzk.settings.Settings;
import it.geosolutions.geoserver.rest.GeoServerRESTManager;
import it.geosolutions.geoserver.rest.GeoServerRESTPublisher;
import it.geosolutions.geoserver.rest.GeoServerRESTReader;
import it.geosolutions.geoserver.rest.decoder.RESTDataStoreList;
import it.geosolutions.geoserver.rest.decoder.RESTLayerList;
import it.geosolutions.geoserver.rest.decoder.utils.NameLinkElem;
import it.geosolutions.geoserver.rest.encoder.GSLayerEncoder;
import it.geosolutions.geoserver.rest.encoder.datastore.GSAbstractDatastoreEncoder;
import it.geosolutions.geoserver.rest.encoder.datastore.GSShapefileDatastoreEncoder;
import it.geosolutions.geoserver.rest.encoder.feature.GSFeatureTypeEncoder;
import it.geosolutions.geoserver.rest.manager.GeoServerRESTStoreManager;
import org.apache.commons.io.FilenameUtils;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.*;
import java.util.logging.Logger;

public class GeoServer {

    private static final Logger logger = Logger.getLogger(GeoServer.class.getName());

    private static final Settings settings = Settings.getInstance();

    public static void registerShapefiles() {

        try {
            URL url = new URL(settings.getGeoServerUrl());
            String username = settings.getGeoServerUsername();
            String password = settings.getGeoServerPassword();
            String workspace = settings.getGeoServerWorkspace();

            GeoServerRESTManager manager = new GeoServerRESTManager(url, username, password);

            clear(manager, workspace);
            for (String shapeFile : getListOfShapeFiles()) {
                createStore(shapeFile, manager, workspace);
                createLayer(shapeFile, manager, workspace);
            }
        } catch (MalformedURLException e) {
            logger.severe(e.getMessage());
        }
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

    private static void clear(GeoServerRESTManager manager, String workspace) throws MalformedURLException {
        GeoServerRESTReader reader = manager.getReader();
        GeoServerRESTPublisher publisher = manager.getPublisher();
        GeoServerRESTStoreManager storeManager = manager.getStoreManager();
        RESTLayerList layers = reader.getLayers();
        if (layers != null) {
            for (NameLinkElem layer : layers) {
                String layerName = layer.getName();
                publisher.unpublishFeatureType(workspace, layerName, layerName);
            }
        }
        RESTDataStoreList datastores = reader.getDatastores(workspace);
        if (datastores != null) {
            for (NameLinkElem dataStore : datastores) {
                String dataStoreName = dataStore.getName();
                storeManager.remove(workspace, getDataStoreEncoder(dataStoreName), false);
            }
        }
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
