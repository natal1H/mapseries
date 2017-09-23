package cz.mzk.mapseries.update.dao;

import java.util.ArrayList;
import java.util.List;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@Entity
public class SheetsDAO {
    
    @Id
    private String id;
    
    @ManyToOne
    private SerieDAO serie;
    
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<SheetDAO> sheets = new ArrayList<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public SerieDAO getSerie() {
        return serie;
    }

    public void setSerie(SerieDAO serie) {
        this.serie = serie;
    }

    public List<SheetDAO> getSheets() {
        return sheets;
    }

    public void setSheets(List<SheetDAO> sheets) {
        this.sheets = sheets;
    }
    
    public void addSheet(SheetDAO sheet) {
        sheet.setParent(this);
        sheets.add(sheet);
    }
    
}
