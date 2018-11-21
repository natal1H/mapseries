package cz.mzk.mapseries.jsf.beans;

import cz.mzk.mapseries.managers.SeriesManager;
import cz.mzk.mapseries.dao.SerieDAO;
import cz.mzk.mapseries.dao.SheetDAO;
import org.jboss.logging.Logger;

import javax.ejb.EJB;
import javax.enterprise.inject.Model;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import javax.inject.Inject;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@Model
public class Series {
    
    private static final Logger LOG = Logger.getLogger(Series.class);
    
    @EJB
    private SeriesManager seriesManager;
    
    @Inject
    private User user;
    
    private String serie;
    
    private String sheet;
    
    private int issue = 0;
    
    private List<SerieDAO> series;
    
    private List<SheetDAO> sheets;
    
    private SheetDAO activeSheet;

    public String getSerie() {
        return serie;
    }

    public void setSerie(String serie) {
        this.serie = serie;
    }
    
    public boolean isSerieDefined() {
        return serie != null;
    }

    public String getSheet() {
        return sheet;
    }

    public void setSheet(String sheet) {
        this.sheet = sheet;
    }

    public int getIssue() {
        return issue;
    }

    public void setIssue(int issue) {
        this.issue = issue;
    }
    
    public SerieDAO getSerieDAO() {
        return seriesManager.getSerie(serie);
    }
    
    public List<SerieDAO> getSeries() {
        if (series == null) {
            series = seriesManager.getSeries();
        }
        return series;
    }
    
    public List<SheetDAO> getSheets() {
        if (sheets == null) {
            sheets = seriesManager.getSheets(serie, sheet);
        }
        return sheets;
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
    
    public boolean isSerieActive(SerieDAO serieDao) {
        return serieDao.getName().equals(serie);
    }
    
    public boolean isSheetActive(long issue) {
        return this.issue == issue;
    }
    
    public SheetDAO getActiveSheet() {
        if (activeSheet == null) {
            activeSheet = getSheets().get(issue);
        }
        return activeSheet;
    }
    
    public boolean isIssueFirst() {
        return issue == 0;
    }
    
    public boolean isIssueLast() {
        return issue == getSheets().size() - 1;
    }
    
    public String getSerieDescription() {
        Optional<String> description = seriesManager.getSerieDescription(serie, user.getLang());
        return description.orElse("...");
    }
}
