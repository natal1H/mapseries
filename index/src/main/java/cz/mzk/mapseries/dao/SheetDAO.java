package cz.mzk.mapseries.dao;

import cz.mzk.mapseries.Constants;
import javax.persistence.*;
import org.jboss.logging.Logger;

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
    
    private String author;

    private String otherAuthors;

    private String publisher;

    private String issue;

    private String description;

    private String signature;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getOtherAuthors() {
        return otherAuthors;
    }

    public void setOtherAuthors(String otherAuthors) {
        this.otherAuthors = otherAuthors;
    }

    public String getPublisher() {
        return publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public String getIssue() {
        return issue;
    }

    public void setIssue(String issue) {
        this.issue = issue;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }
    
    public boolean isThumbnailUnavailable() {
        return Constants.THUMBNAIL_UNAVAILABLE.equals(thumbnailUrl);
    }
    
    public boolean isThumbnailCopyrighted() {
        Logger log = Logger.getLogger(SheetDAO.class);
        boolean result = Constants.THUMBNAIL_COPYRIGHTED.equals(thumbnailUrl);
        log.info("isThumbnailCopyrighted:" + result, new Exception());
        return result;
    }
}
