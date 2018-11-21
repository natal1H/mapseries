package cz.mzk.mapseries.managers;

import cz.mzk.mapseries.dao.SerieDAO;
import cz.mzk.mapseries.dao.SheetDAO;

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
        return em.createQuery("SELECT s FROM SerieDAO s", SerieDAO.class).getResultList();
    }
    
    public SerieDAO getSerie(String id) {
        return em.find(SerieDAO.class, id);
    }
    
    public Optional<String> getSerieDescription(String serieName, String lang) {
        TypedQuery<String> query = em.createQuery("SELECT d.text FROM DescriptionDAO d WHERE d.serie.name = :serieName AND d.lang = :lang", String.class);
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
        TypedQuery<SheetDAO> query = em.createQuery("SELECT sheet FROM SheetDAO sheet WHERE sheet.serie.name = :serieName AND sheet.sheetId = :sheetId", SheetDAO.class);
        query.setParameter("serieName", serieName);
        query.setParameter("sheetId", sheetId);
        return query.getResultList();
    }

    public List<String> getSheetIds(String serieName) {
        TypedQuery<String> query = em.createQuery("SELECT DISTINCT sheet.sheetId FROM SheetDAO sheet WHERE sheet.serie.name = :serieName", String.class);
        query.setParameter("serieName", serieName);
        return query.getResultList();
    }
    
}
