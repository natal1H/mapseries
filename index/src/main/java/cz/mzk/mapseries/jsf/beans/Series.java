package cz.mzk.mapseries.jsf.beans;

import cz.mzk.mapseries.update.SeriesManager;
import cz.mzk.mapseries.update.dao.SerieDAO;
import cz.mzk.mapseries.update.dao.SheetDAO;
import cz.mzk.mapseries.update.dao.SheetsDAO;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.ejb.EJB;
import javax.enterprise.inject.Model;
import org.jboss.logging.Logger;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@Model
public class Series {
    
    private static final Logger LOG = Logger.getLogger(Series.class);
    
    @EJB
    private SeriesManager seriesManager;
    
    private String serie;
    
    private String sheet;

    public String getSerie() {
        return serie;
    }

    public void setSerie(String serie) {
        this.serie = serie;
    }

    public String getSheet() {
        return sheet;
    }

    public void setSheet(String sheet) {
        this.sheet = sheet;
    }
    
    public SerieDAO getSerieDAO() {
        return seriesManager.getSerie(serie);
    }
    
    public List<SerieDAO> getSeries() {
        return seriesManager.getSeries();
    }
    
    public List<SheetDAO> getSheets() {
        
        Map<String, SheetsDAO> sheets = getSheetsMap();
        
        if (sheets == null) {
            return Collections.EMPTY_LIST;
        }
        
        SheetsDAO sheetsDao = sheets.get(sheet);
        
        if (sheetsDao == null) {
            return Collections.EMPTY_LIST;
        }
        
        return sheetsDao.getSheets();
    }
    
    public String getSheetIds() {
        
        Set<String> ids = new HashSet<>();
        Map<String, SheetsDAO> sheets = getSheetsMap();
        
        for (Map.Entry<String, SheetsDAO> entry : sheets.entrySet()) {
            if (!entry.getValue().getSheets().isEmpty()) {
                ids.add(entry.getKey());
            }
        }
        
        StringBuilder sb = new StringBuilder("[");
        
        Iterator<String> it = ids.iterator();
        
        while (it.hasNext()) {
            String id = it.next();
            sb.append(String.format("'%s'", id));
            
            if (it.hasNext()) {
                sb.append(",");
            }
        }
        sb.append("]");
        return sb.toString();
    }
    
    private Map<String, SheetsDAO> getSheetsMap() {
        SerieDAO serieDAO = getSerieDAO();
        if (serieDAO == null) {
            return Collections.EMPTY_MAP;
        }
        
        Map<String, SheetsDAO> sheets = serieDAO.getSheets();
        if (sheets == null) {
            return Collections.EMPTY_MAP;
        }
        
        return sheets;
    }
}
