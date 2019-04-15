package cz.mzk.mapseries.tests.integration;

import cz.mzk.mapseries.dao.CurrentVersionDAO;
import cz.mzk.mapseries.dao.SerieDAO;
import cz.mzk.mapseries.dao.SheetDAO;
import cz.mzk.mapseries.managers.SeriesManager;
import org.junit.*;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.Persistence;

public class PersistenceModelTestCase {

    private EntityManager em;

    private EntityTransaction tx;

    @Before
    public void setup() {
        em = Persistence.createEntityManagerFactory("integration-test").createEntityManager();
        tx = em.getTransaction();
    }

    @After
    public void tearDown() {
        em.clear();
        em.close();
    }

    @Test
    public void sheetsWithSameIdTest() {

        CurrentVersionDAO currentVersion = new CurrentVersionDAO();
        currentVersion.setValue(1);

        SerieDAO serie1 = new SerieDAO();
        serie1.setName("Serie 1");
        serie1.setVersion(1);

        SerieDAO serie2 = new SerieDAO();
        serie2.setName("Serie 2");
        serie2.setVersion(1);

        SheetDAO sheet1 = new SheetDAO();
        sheet1.setSerie(serie1.getName());
        sheet1.setSheetId("1");
        sheet1.setTitle("Sheet 1");
        sheet1.setYear("2018");
        sheet1.setThumbnailUrl("http://thumbnail");
        sheet1.setDigitalLibraryUrl("http://digitalLibrary");
        sheet1.setVufindUrl("http://vufind");
        sheet1.setVersion(1);

        SheetDAO sheet2 = new SheetDAO();
        sheet2.setSerie(serie2.getName());
        sheet2.setSheetId("1");
        sheet2.setTitle("Sheet 2");
        sheet2.setYear("2018");
        sheet2.setThumbnailUrl("http://thumbnail");
        sheet2.setDigitalLibraryUrl("http://digitalLibrary");
        sheet2.setVufindUrl("http://vufind");
        sheet2.setVersion(1);

        tx.begin();
        em.persist(currentVersion);
        em.persist(serie1);
        em.persist(serie2);
        em.persist(sheet1);
        em.persist(sheet2);
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
        CurrentVersionDAO currentVersion = new CurrentVersionDAO();
        currentVersion.setValue(1);

        SerieDAO serie = new SerieDAO();
        serie.setName("Serie");
        serie.setVersion(1);

        SheetDAO sheet1 = new SheetDAO();
        sheet1.setSerie(serie.getName());
        sheet1.setSheetId("1");
        sheet1.setTitle("Sheet 1");
        sheet1.setYear("2018");
        sheet1.setThumbnailUrl("http://thumbnail");
        sheet1.setDigitalLibraryUrl("http://digitalLibrary");
        sheet1.setVufindUrl("http://vufind");
        sheet1.setVersion(1);

        SheetDAO sheet2 = new SheetDAO();
        sheet2.setSerie(serie.getName());
        sheet2.setSheetId("1");
        sheet2.setTitle("Sheet 2");
        sheet2.setYear("2018");
        sheet2.setThumbnailUrl("http://thumbnail");
        sheet2.setDigitalLibraryUrl("http://digitalLibrary");
        sheet2.setVufindUrl("http://vufind");
        sheet2.setVersion(1);

        tx.begin();
        em.persist(currentVersion);
        em.persist(serie);
        em.persist(sheet1);
        em.persist(sheet2);
        tx.commit();

        SeriesManager seriesManager = new SeriesManager();
        seriesManager.setEntityManager(em);

        Assert.assertEquals("Serie does not contain expected number of sheets", 2, seriesManager.getSheets("Serie", "1").size());
    }

}
