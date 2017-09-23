package cz.mzk.mapseries.update;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
public class ContentDefinition {
    
    private String field;
    
    private String name;
    
    private String grid;
    
    private String sheets;
    
    private String groupBy;
    
    private String thumbnailUrl;
    
    private ContentDefinition() {}

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGrid() {
        return grid;
    }

    public void setGrid(String grid) {
        this.grid = grid;
    }

    public String getSheets() {
        return sheets;
    }

    public void setSheets(String sheets) {
        this.sheets = sheets;
    }

    public String getGroupBy() {
        return groupBy;
    }

    public void setGroupBy(String groupBy) {
        this.groupBy = groupBy;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }
    
    public static List<ContentDefinition> readFromJSONArray(String jsonString) {
        JSONArray definitions = new JSONArray(jsonString);
        List<ContentDefinition> result = new ArrayList<>();
        
        for (Object definitionObject : definitions) {
            if (definitionObject instanceof JSONObject) {
                JSONObject definition = (JSONObject) definitionObject;
                ContentDefinition contentDefinition = new ContentDefinition();
                contentDefinition.setField(definition.getString("field"));
                contentDefinition.setName(definition.getString("name"));
                contentDefinition.setGrid(definition.getString("grid"));
                contentDefinition.setSheets(definition.getString("sheets"));
                contentDefinition.setGroupBy(definition.getString("groupby"));
                contentDefinition.setThumbnailUrl(definition.getString("thumbnailUrl"));
                result.add(contentDefinition);
            }
        }
       
        return result;
    }

    @Override
    public int hashCode() {
        int hash = 3;
        hash = 47 * hash + Objects.hashCode(this.name);
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final ContentDefinition other = (ContentDefinition) obj;
        if (!Objects.equals(this.name, other.name)) {
            return false;
        }
        return true;
    }
    
}
