package cz.mzk.tools;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class Settings {

    private static final Logger logger = LoggerFactory.getLogger(Settings.class);

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
            logger.warn("Unable to load settings", e);
        }
    }

    private String get(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }

    public String getLocalRepo() {
        return get("local.repo", "/tmp/mapseries");
    }

    public String getRemoteRepo() {
        return get("remote.repo", "https://github.com/moravianlibrary/mapseries-data.git");
    }

    public String getGeoServerUrl() {
        return get("geoserver.url", "http://localhost:8080/geoserver");
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

    public String getStyleName() {
        return get("geoserver.style.name", "polygon");
    }

    public String getStyleFile() {
        return get("geoserver.style.file", "default.sld");
    }

}
