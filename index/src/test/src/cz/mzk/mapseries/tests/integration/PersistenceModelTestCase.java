package cz.mzk.mapseries.tests.integration;

import cz.mzk.mapseries.update.SeriesManager;
import cz.mzk.mapseries.update.dao.SerieDAO;
import cz.mzk.mapseries.update.dao.SheetDAO;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.Persistence;

public class PersistenceModelTestCase {

    private static EntityManager em;

    private static EntityTransaction tx;

    @BeforeClass
    public static void setup() {
        em = Persistence.createEntityManagerFactory("integration-test").createEntityManager();
        tx = em.getTransaction();
    }

    @AfterClass
    public static void tearDown() {
        em.clear();
        em.close();
    }

    @Test
    public void sheetsWithSameIdTest() {

        SerieDAO serie1 = new SerieDAO();
        serie1.setName("Serie 1");

        SerieDAO serie2 = new SerieDAO();
        serie2.setName("Serie 2");

        SheetDAO sheet1 = new SheetDAO();
        sheet1.setSerie(serie1);
        sheet1.setSheetId("1");
        sheet1.setTitle("Sheet 1");
        sheet1.setYear("2018");
        sheet1.setThumbnailUrl("http://thumbnail");
        sheet1.setDigitalLibraryUrl("http://digitalLibrary");
        sheet1.setVufindUrl("http://vufind");

        SheetDAO sheet2 = new SheetDAO();
        sheet2.setSerie(serie2);
        sheet2.setSheetId("1");
        sheet2.setTitle("Sheet 2");
        sheet2.setYear("2018");
        sheet2.setThumbnailUrl("http://thumbnail");
        sheet2.setDigitalLibraryUrl("http://digitalLibrary");
        sheet2.setVufindUrl("http://vufind");

        tx.begin();
        em.merge(serie1);
        em.merge(serie2);
        em.merge(sheet1);
        em.merge(sheet2);
        tx.commit();

        SeriesManager seriesManager = new SeriesManager();
        seriesManager.setEntityManager(em);

        Assert.assertEquals("Serie 1 does not contain expected number of sheets", 1, seriesManager.getSheets("Serie 1", "1").size());
        Assert.assertEquals("Serie 2 does not contain expected number of sheets", 1, seriesManager.getSheets("Serie 2", "1").size());

        Assert.assertEquals("Serie 1 contains wrong sheet", "Sheet 1", seriesManager.getSheets("Serie 1", "1").get(0).getTitle());
        Assert.assertEquals("Serie 1 contains wrong sheet", "Sheet 2", seriesManager.getSheets("Serie 2", "1").get(0).getTitle());

    }

    @Test
    public void sheetsWithSameIdInOneSerieTest() {
        SerieDAO serie = new SerieDAO();
        serie.setName("Serie");

        SheetDAO sheet1 = new SheetDAO();
        sheet1.setSerie(serie);
        sheet1.setSheetId("1");
        sheet1.setTitle("Sheet 1");
        sheet1.setYear("2018");
        sheet1.setThumbnailUrl("http://thumbnail");
        sheet1.setDigitalLibraryUrl("http://digitalLibrary");
        sheet1.setVufindUrl("http://vufind");

        SheetDAO sheet2 = new SheetDAO();
        sheet2.setSerie(serie);
        sheet2.setSheetId("1");
        sheet2.setTitle("Sheet 2");
        sheet2.setYear("2018");
        sheet2.setThumbnailUrl("http://thumbnail");
        sheet2.setDigitalLibraryUrl("http://digitalLibrary");
        sheet2.setVufindUrl("http://vufind");

        tx.begin();
        em.merge(serie);
        em.merge(sheet1);
        em.merge(sheet2);
        tx.commit();

        SeriesManager seriesManager = new SeriesManager();
        seriesManager.setEntityManager(em);

        Assert.assertEquals("Serie does not contain expected number of sheets", 2, seriesManager.getSheets("Serie", "1").size());
    }

}
