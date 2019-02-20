package cz.mzk.mapseries;

import javax.enterprise.inject.Produces;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
public class Resources {
    
    @Produces
    @PersistenceContext
    private EntityManager em;
    
}