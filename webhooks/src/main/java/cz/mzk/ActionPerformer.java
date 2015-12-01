package cz.mzk;

import cz.mzk.tools.FormatTransformer;
import cz.mzk.tools.GeoServer;
import cz.mzk.tools.Github;

public class ActionPerformer {

    public static synchronized void cloneAndTransformGeoJsonToShp() {

        Github.cloneRepo();

        FormatTransformer.transform();

        GeoServer.registerShapefiles();
    }

}
