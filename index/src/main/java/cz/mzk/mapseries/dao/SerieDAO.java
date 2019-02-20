package cz.mzk.mapseries.dao;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@Entity
public class SerieDAO {
    
    private static final Pattern SPACE_REPLACE = Pattern.compile("(\\d) (\\d)");
    
    @Id
    private String name;
    
    private String grid;
    
    private String thumbnailUrl;

    public String getName() {
        return name;
    }
    
    public String getNameHtml() {
        return SPACE_REPLACE.matcher(name).replaceAll("$1&nbsp;$2");
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SerieDAO serieDAO = (SerieDAO) o;
        return Objects.equals(name, serieDAO.name) &&
                Objects.equals(grid, serieDAO.grid) &&
                Objects.equals(thumbnailUrl, serieDAO.thumbnailUrl);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, grid, thumbnailUrl);
    }

    @Override
    public String toString() {
        return "SerieDAO{" +
                "name='" + name + '\'' +
                ", grid='" + grid + '\'' +
                ", thumbnailUrl='" + thumbnailUrl + '\'' +
                '}';
    }
}
