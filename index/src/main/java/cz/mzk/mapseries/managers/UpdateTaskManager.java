package cz.mzk.mapseries.managers;

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
    
    public void updateTask(UpdateTaskDAO task) {
        em.merge(task);
    }
    
    public List<UpdateTaskDAO> getTasks(int limit) {
        return em.createQuery(
            "SELECT t FROM UpdateTaskDAO t ORDER BY t.startDate DESC, t.id DESC")
            .setMaxResults(limit)
            .getResultList();
    }
    
    public List<UpdateTaskDAO> getUnfinishedTasks() {
        return em.createQuery(
            "SELECT t FROM UpdateTaskDAO t WHERE t.startDate is NULL")
            .getResultList();
    }
    
}
