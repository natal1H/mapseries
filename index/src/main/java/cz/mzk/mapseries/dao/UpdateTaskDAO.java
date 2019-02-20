package cz.mzk.mapseries.dao;

import java.io.Serializable;
import java.sql.Clob;
import java.time.ZonedDateTime;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@Entity
public class UpdateTaskDAO implements Serializable {
    
    @SequenceGenerator(name="updatetaskdao_seq",
                       sequenceName="updatetaskdao_seq",
                       allocationSize=1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE,
                    generator="updatetaskdao_seq")
    @Id
    private long id;
    
    private boolean result;
    
    private Clob log;
    
    private ZonedDateTime startDate;
    
    private ZonedDateTime endDate;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public boolean isResult() {
        return result;
    }

    public void setResult(boolean result) {
        this.result = result;
    }

    public Clob getLog() {
        return log;
    }

    public void setLog(Clob log) {
        this.log = log;
    }
    
    public ZonedDateTime getStartDate() {
        return startDate;
    }
    
    public void setStartDate(ZonedDateTime date) {
        this.startDate = date;
    }
    
    public ZonedDateTime getEndDate() {
        return endDate;
    }
    
    public void setEndDate(ZonedDateTime date) {
        this.endDate = date;
    }

    @Override
    public int hashCode() {
        int hash = 5;
        hash = 97 * hash + (int) (this.id ^ (this.id >>> 32));
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final UpdateTaskDAO other = (UpdateTaskDAO) obj;
        if (this.id != other.id) {
            return false;
        }
        return true;
    }
    
    
}
