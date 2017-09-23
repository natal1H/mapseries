package cz.mzk.mapseries.dao;

import javax.persistence.Entity;
import javax.persistence.Id;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@Entity
public class AdminDAO {
    
    @Id
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    
}
