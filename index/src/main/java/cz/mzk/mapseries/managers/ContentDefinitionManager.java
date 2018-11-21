package cz.mzk.mapseries.managers;

import com.google.common.base.Suppliers;
import cz.mzk.mapseries.github.GithubService;
import static cz.mzk.mapseries.jsf.beans.Configuration.CONTENT_DEFINITION_PATH;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@RequestScoped
public class ContentDefinitionManager {
    
    private final Supplier<String> rawData;
    
    private final Supplier<List<ContentDefinitionItem>> definitions = Suppliers.memoize(this::definitionsLoader);
    
    @Inject
    private GithubService githubService;
    
    public ContentDefinitionManager() {
        rawData = Suppliers.memoize(this::rawDataLoader);
    }
    
    private ContentDefinitionManager(String jsonString) {
        rawData = () -> jsonString;
    }
    
    public static ContentDefinitionManager fromJsonString(String jsonString) {
        return new ContentDefinitionManager(jsonString);
    }
    
    public String getRawData() {
        return rawData.get();
    }
    
    private String rawDataLoader() {
        try {
            return githubService.loadFile("/" + CONTENT_DEFINITION_PATH);
        } catch (Exception e) {
            throw new RuntimeException("Error at loading data from github.", e);
        }
    }
    
    public List<ContentDefinitionItem> getDefinitions() {
        return definitions.get();
    }
    
    private List<ContentDefinitionItem> definitionsLoader() {
        List<ContentDefinitionItem> result = new ArrayList<>();
        JSONArray jsonData = new JSONArray(getRawData());
        
        for (Object objectItem : jsonData) {
            if (!(objectItem instanceof JSONObject)) {
                throw new IllegalStateException("JSON data has unexpected format.");
            }
            JSONObject jsonItem = (JSONObject) objectItem;
            ContentDefinitionItem item = new ContentDefinitionItem.Builder()
                    .withField(jsonItem.getString("field"))
                    .withName(jsonItem.getString("name"))
                    .withGrid(jsonItem.getString("grid"))
                    .withSheets(jsonItem.getString("sheets"))
                    .withGroupBy(jsonItem.getString("groupby"))
                    .withThumbnailUrl(jsonItem.getString("thumbnailUrl"))
                    .withDescription(parseDescription(jsonItem.optJSONObject("description")))
                    .build();
            result.add(item);
        }
        
        return result;
    }
    
    private Map<String, String> parseDescription(JSONObject description) {
        if (description == null) {
            return Collections.EMPTY_MAP;
        }
        
        return description.keySet().stream()
                .collect(Collectors.toMap(Function.identity(), key -> description.getString(key)));
    }
    
}
