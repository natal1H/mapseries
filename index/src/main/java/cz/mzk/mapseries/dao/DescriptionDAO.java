package cz.mzk.mapseries.dao;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@Entity
public class DescriptionDAO {
    
    @SequenceGenerator(name="descriptiondao_seq",
            sequenceName="descriptiondao_seq",
            allocationSize=1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE,
            generator="descriptiondao_seq")
    @Id
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serie_id")
    private SerieDAO serie;
    
    private String lang;
    
    @Column(columnDefinition="text")
    private String text;

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

    public String getLang() {
        return lang;
    }

    public void setLang(String lang) {
        this.lang = lang;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
    
    
    
}
