package cz.mzk.mapseries.update.dao;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@Entity
public class SheetDAO {
    
    @SequenceGenerator(name="sheetdao_seq",
                       sequenceName="sheetdao_seq",
                       allocationSize=1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE,
                    generator="sheetdao_seq")
    @Id
    private Long id;
    
    private String title;
    
    private String year;
    
    private String digitalLibraryUrl;
    
    private String vufindUrl;
    
    private String thumbnailUrl;
    
    @ManyToOne
    private SheetsDAO parent;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public String getDigitalLibraryUrl() {
        return digitalLibraryUrl;
    }

    public void setDigitalLibraryUrl(String digitalLibraryUrl) {
        this.digitalLibraryUrl = digitalLibraryUrl;
    }

    public String getVufindUrl() {
        return vufindUrl;
    }

    public void setVufindUrl(String vufindUrl) {
        this.vufindUrl = vufindUrl;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }
    
    public SheetsDAO getParent() {
        return parent;
    }

    public void setParent(SheetsDAO parent) {
        this.parent = parent;
    }
    
    
    
}
