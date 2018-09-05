package cz.mzk.mapseries.jsf.beans;

import cz.mzk.mapseries.update.SeriesManager;
import cz.mzk.mapseries.update.dao.SerieDAO;
import cz.mzk.mapseries.update.dao.SheetDAO;
import org.jboss.logging.Logger;

import javax.ejb.EJB;
import javax.enterprise.inject.Model;
import java.util.Iterator;
import java.util.List;

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

        return seriesManager.getSheets(serie, sheet);
    }
    
    public String getSheetIds() {
        
        List<String> ids = seriesManager.getSheetIds(serie);
        
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
}
