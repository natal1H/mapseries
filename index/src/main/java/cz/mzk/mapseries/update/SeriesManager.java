package cz.mzk.mapseries.update;

import cz.mzk.mapseries.update.dao.SerieDAO;
import java.util.List;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@Stateless
public class SeriesManager {
    
    @Inject
    private EntityManager em;
    
    public List<SerieDAO> getSeries() {
        return em.createQuery("SELECT s FROM SerieDAO s").getResultList();
    }
    
    public SerieDAO getSerie(String id) {
        return em.find(SerieDAO.class, id);
    }
    
}
