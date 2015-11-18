package cz.mzk.settings;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import java.util.logging.Logger;

public class Settings {

    private static final Logger logger = Logger.getLogger(Settings.class.getName());

    private static Settings instance;

    private Properties properties;

    public static synchronized Settings getInstance() {
        if (instance == null) {
            instance = new Settings(System.getenv("MAPSERIES_WEBHOOKS_SETTINGS"));
        }
        return instance;
    }

    private Settings() {
    }

    private Settings(String location) {
        String path = location;
        if (path == null) {
            path = "/etc/mapseries/webhooks.conf";
        }
        properties = new Properties();
        try {
            properties.load(new FileInputStream(path));
        } catch (IOException e) {
            logger.warning(e.getMessage());
        }
    }

    private String get(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }

    public String getLocalRepo() {
        return get("local.repo", "/tmp/mapseries");
    }

    public String getRemoteRepo() {
        return get("remote.repo", "https://github.com/moravianlibrary/mapseries.git");
    }

    public String getGeoServerUrl() {
        return get("geoserver.url", "http://mapseries.georeferencer.org/geoserver");
    }

    public String getGeoServerUsername() {
        return get("geoserver.username", "");
    }

    public String getGeoServerPassword() {
        return get("geoserver.password", "");
    }

    public String getGeoServerDataDir() {
        return get("geoserver.data.dir", "/tmp");
    }

    public String getGeoServerWorkspace() {
        return get("geoserver.workspace", "mapseries");
    }

}
