package cz.mzk.tools;

import cz.mzk.settings.Settings;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.geotools.data.DefaultTransaction;
import org.geotools.data.FeatureStore;
import org.geotools.data.Transaction;
import org.geotools.data.shapefile.ShapefileDataStore;
import org.geotools.data.shapefile.ShapefileDataStoreFactory;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.data.simple.SimpleFeatureStore;
import org.geotools.feature.FeatureCollection;
import org.geotools.geojson.feature.FeatureJSON;
import org.geotools.geojson.geom.GeometryJSON;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.opengis.feature.simple.SimpleFeatureType;

import java.io.*;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

public class FormatTransformer {

    private static final Logger logger = Logger.getLogger(FormatTransformer.class.getName());

    private static final Settings settings = Settings.getInstance();

    public static void transform() {
        String repo = settings.getLocalRepo();
        File shpDir = new File(settings.getShapeFileDir());
        File srcDir = new File(repo, "data");

        logger.info("Start transform files from directory: " + srcDir.getPath());
        try {
            FileUtils.cleanDirectory(shpDir);
        } catch (IOException e) {
            logger.severe(e.getMessage());
        }

        logger.info("Clean directory: " + shpDir.getPath());

        for (File geoJsonFile : srcDir.listFiles()) {
            File outFile = new File(shpDir, FilenameUtils.getBaseName(geoJsonFile.getName()) + ".shp");
            logger.info(String.format("Transform file %s to %s", geoJsonFile.getPath(), outFile.getPath()));
            try {
                transform(geoJsonFile, outFile);
            } catch (Exception e) {
                logger.severe(e.getMessage());
            }
        }
    }

    private static void transform(File src, File dst) throws Exception {
        ShapefileDataStoreFactory dataStoreFactory = new ShapefileDataStoreFactory();

        Map<String, Serializable> params = new HashMap<String, Serializable>();
        params.put("url", dst.toURI().toURL());
        params.put("create spatial index", Boolean.TRUE);

        ShapefileDataStore shpDataStore = (ShapefileDataStore) dataStoreFactory.createNewDataStore(params);

        InputStream srcInput = new FileInputStream(src);
        GeometryJSON gjson = new GeometryJSON(15);
        FeatureJSON fjson = new FeatureJSON(gjson);
        FeatureCollection fc = fjson.readFeatureCollection(srcInput);

        SimpleFeatureType type = (SimpleFeatureType) fc.getSchema();
        shpDataStore.createSchema(type);
        shpDataStore.forceSchemaCRS(DefaultGeographicCRS.WGS84);

        Transaction transaction = new DefaultTransaction("create");
        String typeName = shpDataStore.getTypeNames()[0];
        SimpleFeatureSource featureSource = shpDataStore.getFeatureSource(typeName);

        if (featureSource instanceof FeatureStore) {
            SimpleFeatureStore featureStore = (SimpleFeatureStore) featureSource;
            featureStore.setTransaction(transaction);
            try {
                featureStore.addFeatures(fc);
                transaction.commit();
            } catch (Exception e) {
                transaction.rollback();
                throw e;
            } finally {
                transaction.close();
            }
        } else {
            throw new IllegalArgumentException(typeName + " does not support read/write access");
        }
    }

}
