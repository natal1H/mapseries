package cz.mzk.mapseries.managers;

import cz.mzk.mapseries.dao.SerieDAO;
import cz.mzk.mapseries.dao.SheetDAO;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@Stateless
public class SeriesManager {
    
    @Inject
    private EntityManager em;

    /**
     * Only for tests
     * @param em
     */
    public void setEntityManager(EntityManager em) {
        this.em = em;
    }
    
    public List<SerieDAO> getSeries() {
        return em.createQuery("SELECT s FROM SerieDAO s WHERE s.version = (SELECT value FROM CurrentVersionDAO)", SerieDAO.class).getResultList();
    }
    
    public SerieDAO getSerie(String id) {
        TypedQuery<SerieDAO> query = em.createQuery("SELECT s FROM SerieDAO s WHERE s.name = :id AND s.version = (SELECT value FROM CurrentVersionDAO)", SerieDAO.class);
        query.setParameter("id", id);

        return query.getSingleResult();
    }
    
    public Optional<String> getSerieDescription(String serieName, String lang) {
        TypedQuery<String> query = em.createQuery("SELECT d.text FROM DescriptionDAO d WHERE d.serie = :serieName AND d.lang = :lang AND d.version = (SELECT value FROM CurrentVersionDAO)", String.class);
        query.setParameter("serieName", serieName);
        query.setParameter("lang", lang);
        List<String> result = query.getResultList();
        
        if (result.isEmpty()) {
            return Optional.empty();
        } else {
            return Optional.of(result.get(0));
        }
    }

    public List<SheetDAO> getSheets(String serieName, String sheetId) {
        TypedQuery<SheetDAO> query = em.createQuery("SELECT sheet FROM SheetDAO sheet WHERE sheet.serie = :serieName AND sheet.sheetId = :sheetId AND sheet.version = (SELECT value FROM CurrentVersionDAO)", SheetDAO.class);
        query.setParameter("serieName", serieName);
        query.setParameter("sheetId", sheetId);

        List<SheetDAO> result = query.getResultList();
        result.sort(Comparator.comparingInt(a -> parseInt(a.getYear())));

        return result;
    }

    private int parseInt(String s)
    {
        try {
            return Integer.parseInt(s);
        } catch (Exception e) {
            return 0;
        }
    }

    public List<String> getSheetIds(String serieName) {
        TypedQuery<String> query = em.createQuery("SELECT DISTINCT sheet.sheetId FROM SheetDAO sheet WHERE sheet.serie = :serieName AND sheet.version = (SELECT value FROM CurrentVersionDAO)", String.class);
        query.setParameter("serieName", serieName);
        return query.getResultList();
    }
    
}
