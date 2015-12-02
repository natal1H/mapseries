package cz.mzk;

import cz.mzk.tools.FormatTransformer;
import cz.mzk.tools.GeoServer;
import cz.mzk.tools.Github;

public class ActionPerformer {

    public static synchronized void init() {

        Github.cloneRepo();

        GeoServer.createWorkspace();

        FormatTransformer.transform();

        GeoServer.registerShapefiles();
    }

    public static synchronized void onPush() {

        Github.cloneRepo();

        GeoServer.clear();

        FormatTransformer.transform();

        GeoServer.registerShapefiles();
    }

}
