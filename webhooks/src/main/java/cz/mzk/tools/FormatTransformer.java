package cz.mzk.tools;

import cz.mzk.settings.Settings;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.geotools.feature.FeatureCollection;
import org.geotools.geojson.feature.FeatureJSON;
import org.geotools.geojson.geom.GeometryJSON;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Logger;

public class FormatTransformer {

    private static final Logger logger = Logger.getLogger(FormatTransformer.class.getName());

    private static final Settings settings = Settings.getInstance();

    public static void transform() {
        String repo = settings.getLocalRepo();
        File shpDir = new File(settings.getGeoServerDataDir(), settings.getGeoServerWorkspace());
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

        InputStream srcInput = new FileInputStream(src);
        GeometryJSON gjson = new GeometryJSON(15);
        FeatureJSON fjson = new FeatureJSON(gjson);
        FeatureCollection<SimpleFeatureType, SimpleFeature> fc = fjson.readFeatureCollection(srcInput);

        WriteShapefile writer = new WriteShapefile(dst);
        writer.writeFeatures(fc);
    }

}
