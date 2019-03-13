package cz.mzk.mapseries.jsf.beans;

import cz.mzk.mapseries.dao.SerieDAO;
import cz.mzk.mapseries.dao.SheetDAO;
import cz.mzk.mapseries.github.GithubService;
import cz.mzk.mapseries.managers.SeriesManager;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import javax.ejb.EJB;
import javax.enterprise.inject.Model;
import javax.inject.Inject;
import org.jboss.logging.Logger;
import org.json.JSONArray;
import org.json.JSONObject;

@Model
public class DataAnalyzer {
    
    private static final Logger LOG = Logger.getLogger(DataAnalyzer.class);
    
    private static final String KEY_FEATURES = "features";
    private static final String KEY_PROPERTIES = "properties";
    private static final String KEY_SHEET = "SHEET";
    
    @EJB
    private SeriesManager seriesManager;
    
    @Inject
    private GithubService githubService;
    
    public Map<String, List<SheetDAO>> getNonLinkedMaps() {
            
        Map<String, List<SheetDAO>> result = new HashMap<>();
        
        for (SerieDAO serie : seriesManager.getSeries()) {
            List<SheetDAO> nonLinkedMaps = getNonLinkedMapsForSerie(serie);
            
            if (!nonLinkedMaps.isEmpty()) {
                result.put(serie.getNameHtml(), nonLinkedMaps);
            }
        }
        
        LOG.info(result);
        
        return result;
    }
    
    private List<SheetDAO> getNonLinkedMapsForSerie(SerieDAO serie) {
        List<String> sheetIds = seriesManager.getSheetIds(serie.getName());
        JSONObject geoJson = getGeoJson(serie.getGrid());
        
        return sheetIds
                .stream()
                .filter(id -> idIsNotInGeoJson(id, geoJson))
                .flatMap(id -> seriesManager.getSheets(serie.getName(), id).stream())
                .collect(Collectors.toList());
    }
    
    private JSONObject getGeoJson(String id) {
        try {
            String content = githubService.loadFile(String.format("/geojson/%s.json", id));
            return new JSONObject(content);
        } catch (Exception e) {
            throw new RuntimeException("Error at loading data from Github", e);
        }
    }
    
    private boolean idIsNotInGeoJson(String id, JSONObject geoJson) {
        
        Objects.requireNonNull(id);
        
        if (!geoJson.has(KEY_FEATURES)) {
            throw new IllegalArgumentException("Invalid GeoJson format");
        }
        
        JSONArray features = geoJson.getJSONArray(KEY_FEATURES);
        
        for (Object item : features) {
            if (!(item instanceof JSONObject)) {
                throw new IllegalArgumentException("Invalid GeoJson format");
            }
            JSONObject feature = (JSONObject) item;
            
            if (!feature.has(KEY_PROPERTIES)) {
                continue;
            }
            
            JSONObject properties = feature.getJSONObject(KEY_PROPERTIES);
            
            if (!properties.has(KEY_SHEET)) {
                continue;
            }
            
            Object sheet = properties.get(KEY_SHEET);
            
            if (sheet == null) {
                continue;
            }
            
            if (sheet.toString().equals(id)) {
                return false;
            }
        }
        
        return true;
    }
    
}
