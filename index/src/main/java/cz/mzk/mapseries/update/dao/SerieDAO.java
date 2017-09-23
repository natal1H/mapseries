package cz.mzk.mapseries.update.dao;

import java.util.HashMap;
import java.util.Map;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.MapKey;
import javax.persistence.OneToMany;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@Entity
public class SerieDAO {
    
    @Id
    private String name;
    
    private String grid;
    
    private String thumbnailUrl;
    
    @OneToMany(mappedBy = "serie", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @MapKey(name = "id")
    private Map<String, SheetsDAO> sheets = new HashMap<>();

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

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public Map<String, SheetsDAO> getSheets() {
        return sheets;
    }

    public void setSheets(Map<String, SheetsDAO> sheets) {
        this.sheets = sheets;
    }
    
    public void addSheet(String sheetId, SheetDAO sheet) {
        
        if (sheets.containsKey(sheetId)) {
            SheetsDAO sheetsDAO = sheets.get(sheetId);
            sheetsDAO.addSheet(sheet);
        } else {
            SheetsDAO sheetsDAO = new SheetsDAO();
            sheetsDAO.setId(sheetId);
            sheetsDAO.setSerie(this);
            sheetsDAO.addSheet(sheet);
            sheets.put(sheetId, sheetsDAO);
        }
    }
    
}
