package cz.mzk.mapseries.dao;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class CurrentVersionDAO {

    @Id
    private int id = 1;

    private long value;

    public int getId() {
        return id;
    }

    public long getValue() {
        return value;
    }

    public void setValue(long value) {
        this.value = value;
    }
}
