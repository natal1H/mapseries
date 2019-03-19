package cz.mzk.mapseries.managers;

import cz.mzk.mapseries.dao.CurrentVersionDAO;
import cz.mzk.mapseries.dao.UpdateTaskDAO;
import java.util.List;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@Stateless
public class UpdateTaskManager {
    
    @Inject
    private EntityManager em;
    
    public void persistTask(UpdateTaskDAO task) {
        em.persist(task);
    }
    
    public UpdateTaskDAO findById(long id) {
        return em.find(UpdateTaskDAO.class, id);
    }
    
    public List<UpdateTaskDAO> getTasks() {
        return em.createQuery(
            "SELECT t FROM UpdateTaskDAO t ORDER BY t.startDate DESC, t.id DESC", UpdateTaskDAO.class)
            .getResultList();
    }
    
    public List<UpdateTaskDAO> getUnfinishedTasks() {
        return em.createQuery(
            "SELECT t FROM UpdateTaskDAO t WHERE t.startDate is NULL", UpdateTaskDAO.class)
            .getResultList();
    }
    
    public long getCurrentVersion() {
        return em.createQuery("SELECT value FROM CurrentVersionDAO", Long.class).getSingleResult();
    }
    
    public void setCurrentVersion(long version) {
        
        UpdateTaskDAO task = findById(version);
        
        if (task == null) {
            throw new IllegalArgumentException(String.format("Version %d does not exist.", version));
        }
        
        CurrentVersionDAO currentVersion = new CurrentVersionDAO();
        currentVersion.setValue(version);
        em.merge(currentVersion);
    }
    
}
