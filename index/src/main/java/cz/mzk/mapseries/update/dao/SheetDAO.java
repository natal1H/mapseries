package cz.mzk.mapseries.update.dao;

import javax.persistence.*;
import java.util.Objects;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serie_id")
    private SerieDAO serie;

    private String sheetId;
    
    private String title;
    
    private String year;
    
    private String digitalLibraryUrl;
    
    private String vufindUrl;
    
    private String thumbnailUrl;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return "SheetDAO{" +
                "id=" + id +
                ", serie=" + serie +
                ", sheetId='" + sheetId + '\'' +
                ", title='" + title + '\'' +
                ", year='" + year + '\'' +
                ", digitalLibraryUrl='" + digitalLibraryUrl + '\'' +
                ", vufindUrl='" + vufindUrl + '\'' +
                ", thumbnailUrl='" + thumbnailUrl + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SheetDAO sheetDAO = (SheetDAO) o;
        return Objects.equals(id, sheetDAO.id) &&
                Objects.equals(serie, sheetDAO.serie) &&
                Objects.equals(sheetId, sheetDAO.sheetId) &&
                Objects.equals(title, sheetDAO.title) &&
                Objects.equals(year, sheetDAO.year) &&
                Objects.equals(digitalLibraryUrl, sheetDAO.digitalLibraryUrl) &&
                Objects.equals(vufindUrl, sheetDAO.vufindUrl) &&
                Objects.equals(thumbnailUrl, sheetDAO.thumbnailUrl);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, serie, sheetId, title, year, digitalLibraryUrl, vufindUrl, thumbnailUrl);
    }

    public SerieDAO getSerie() {
        return serie;
    }

    public void setSerie(SerieDAO serie) {
        this.serie = serie;
    }

    public String getSheetId() {
        return sheetId;
    }

    public void setSheetId(String sheetId) {
        this.sheetId = sheetId;
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

}
