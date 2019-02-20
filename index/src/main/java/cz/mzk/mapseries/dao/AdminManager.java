package cz.mzk.mapseries.dao;

import java.util.List;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.Query;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@Stateless
public class AdminManager {
    
    @Inject
    private EntityManager em;
    
    public List<AdminDAO> getAdmins() {
        return em.createQuery("SELECT admin FROM AdminDAO admin").getResultList();
    }
    
    public void addAdmin(String adminName) {
        AdminDAO admin = new AdminDAO();
        admin.setName(adminName);
        em.persist(admin);
    }
    
    public void removeAdmin(String adminName) {
        AdminDAO adminDao = em.find(AdminDAO.class, adminName);
        em.remove(adminDao);
    }
    
    public boolean isAdmin(String userName) {
        Query query = em.createQuery("SELECT admin FROM AdminDAO admin WHERE admin.name = :userName");
        query.setParameter("userName", userName);
        return !query.getResultList().isEmpty();
    }
    
}
