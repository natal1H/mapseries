package cz.mzk.mapseries.update;

import cz.mzk.mapseries.github.GithubService;
import cz.mzk.mapseries.github.GithubServiceUnauthorized;
import cz.mzk.mapseries.jsf.beans.Configuration;
import cz.mzk.mapseries.oai.marc.MarcDataField;
import cz.mzk.mapseries.oai.marc.MarcRecord;
import cz.mzk.mapseries.oai.marc.OaiMarcXmlReader;
import cz.mzk.mapseries.update.dao.SerieDAO;
import cz.mzk.mapseries.update.dao.SheetDAO;
import cz.mzk.mapseries.update.dao.UpdateTaskDAO;
import groovy.lang.Binding;
import groovy.lang.GroovyShell;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.annotation.Resource;
import javax.ejb.EJB;
import javax.ejb.Lock;
import static javax.ejb.LockType.READ;
import javax.ejb.Schedule;
import javax.ejb.Singleton;
import javax.inject.Inject;
import javax.jms.JMSContext;
import javax.jms.Queue;
import javax.jms.TextMessage;
import org.jboss.logging.Logger;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@Singleton
public class UpdateEJB {
    
    private static final Logger LOG = Logger.getLogger(UpdateEJB.class);
    
    private static final String TASK_ID_KEY = "taskId";
    
    private static final Pattern MARC_ID_PATTERN = Pattern.compile("(\\d+)(\\w)");
    
    private volatile UpdateTaskDAO runningTask = null;
    
    @EJB
    private UpdateTaskManager updateTaskManager;
    
    @Inject
    private JMSContext context;
    
    @Inject
    private GithubService githubService;
    
    @Inject
    private GithubServiceUnauthorized githubServiceUnauthorized;

    @Resource(lookup = "java:/jms/queue/UpdateTasks")
    private Queue queue;
    
    private PrintStream log = null;
    
    @Lock(READ)
    public void scheduleUpdateTask() throws Exception {
        
        List<UpdateTaskDAO> unfinishedTasks = updateTaskManager.getUnfinishedTasks();
        if (unfinishedTasks.size() >= 2) {
            return;
        }
        
        UpdateTaskDAO updateTaskDAO = new UpdateTaskDAO();
        updateTaskManager.persistTask(updateTaskDAO);
        
        TextMessage msg = context.createTextMessage(githubService.loadFile("/" + Configuration.CONTENT_DEFINITION_PATH));
        msg.setLongProperty(TASK_ID_KEY, updateTaskDAO.getId());
        context.createProducer().send(queue, msg);
    }
    
    @Schedule(second = "0", minute = "0", hour = "3", persistent = false)
    public void scheduledAutomatically() {
        try {
            List<UpdateTaskDAO> unfinishedTasks = updateTaskManager.getUnfinishedTasks();
            if (unfinishedTasks.size() >= 2) {
                return;
            }

            UpdateTaskDAO updateTaskDAO = new UpdateTaskDAO();
            updateTaskManager.persistTask(updateTaskDAO);

            TextMessage msg = context.createTextMessage(githubServiceUnauthorized.loadFile(Configuration.CONTENT_DEFINITION_PATH));
            msg.setLongProperty(TASK_ID_KEY, updateTaskDAO.getId());
            context.createProducer().send(queue, msg);
        } catch (Exception e) {
            LOG.error("Error thrown when automatically scheduled the task.", e);
            throw new RuntimeException("Error thrown when automatically scheduled the task.", e);
        }
    }
    
    @Lock(READ)
    public synchronized void runUpdateTask(UpdateTaskDAO updateTaskDAO, String definitionJson, List<Object> output) {
        
        runningTask = updateTaskDAO;
        
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        log = new PrintStream(os);
        
        try {
            
            doUpdate(definitionJson, output);
            
            updateTaskDAO.setResult(true);
            
        } catch (Exception e) {
            
            updateTaskDAO.setResult(false);
            log.println("[TASK FAILED] " + e);
            e.printStackTrace(log);
            
        } finally {
            try {
                updateTaskDAO.setLog(os.toString("UTF-8"));
            } catch (UnsupportedEncodingException e) {
                LOG.error("Storing of logs failed because of encoding exception.", e);
            }
            runningTask = null;
            log = null;
        }
    }
    
    @Lock(READ)
    public UpdateTaskDAO getRunningTask() {
        return runningTask;
    }
    
    private void doUpdate(String definitionJson, List<Object> output) throws Exception {
        log.println("Starting update.");
        
        List<ContentDefinition> definitions = ContentDefinition.readFromJSONArray(definitionJson);
        Map<ContentDefinition, SerieDAO> series = new HashMap<>();
        
        OaiMarcXmlReader oaiMarcXmlReader = new OaiMarcXmlReader("http://aleph.mzk.cz/OAI", "MZK01-MAPY");
        
        for (MarcRecord marcRecord : oaiMarcXmlReader) {

            ContentDefinition definition = findDefinitionForRecord(definitions, marcRecord);
            if (definition == null) {
                continue;
            }
            
            SerieDAO serie = series.get(definition);
            if (serie == null) {
                serie = new SerieDAO();
                serie.setName(definition.getName().replaceAll("[\\[\\];]", "").trim());
                serie.setGrid(definition.getGrid());
                serie.setThumbnailUrl(definition.getThumbnailUrl());
                series.put(definition, serie);
                output.add(serie);
            }
            
            String[] marcIds = parseMarcFieldId(definition.getSheets());
            
            if (!marcRecord.hasDataField(marcIds[0])) {
                log.println(String.format("[WARN] following record has no datafield %s: %s", marcIds[0], marcRecord));
                continue;
            }
            
            String sheetId = getOrDefault(marcRecord, marcIds[0], marcIds[1], null);
            
            if (sheetId == null) {
                continue;
            }
            
            sheetId = applyGroovyTransformation(sheetId, definition.getGroupBy());
            
            SheetDAO sheetDAO = new SheetDAO();
            output.add(sheetDAO);

            sheetDAO.setSheetId(sheetId);
            sheetDAO.setSerie(serie);
            sheetDAO.setTitle(getOrDefault(marcRecord, "245", "a", "Unknown"));
            
            String year = getOrDefault(marcRecord, "490", "v", "");
            if (year.contains(",")) {
                int comma = year.indexOf(',');
                year = year.substring(comma + 1).trim();
            }
            sheetDAO.setYear(year);
            
            String digitalLibraryUrl = getOrDefault(marcRecord, "911", "u", "");
            sheetDAO.setDigitalLibraryUrl(digitalLibraryUrl);
            
            if (!digitalLibraryUrl.isEmpty()) {
                String uuid = digitalLibraryUrl.replace("http://www.digitalniknihovna.cz/mzk/uuid/uuid:", "");
                sheetDAO.setThumbnailUrl(String.format("https://kramerius.mzk.cz/search/api/v5.0/item/uuid:%s/thumb", uuid));
            } else {
                sheetDAO.setThumbnailUrl("");
            }
            
            if (!marcRecord.hasControlField("001")) {
                log.println(String.format("[WARN] following record has no controlfield 001: %s", marcRecord));
                sheetDAO.setVufindUrl("");
            } else {
                sheetDAO.setVufindUrl(String.format("https://vufind.mzk.cz/Record/MZK01-%s", marcRecord.getControlField("001")));
            }
            
        }
        
        log.println("Update finished successfully");
    }
    
    private ContentDefinition findDefinitionForRecord(List<ContentDefinition> definitions, MarcRecord marcRecord) throws Exception {
        
        for (ContentDefinition definition : definitions) {
            if (isDefinitionSuitableForRecord(definition, marcRecord)) {
                return definition;
            }
        }
        
        return null;
    }
    
    private boolean isDefinitionSuitableForRecord(ContentDefinition definition, MarcRecord marcRecord) throws Exception {
        String field = definition.getField();
        String[] fieldParsed = parseMarcFieldId(field);
        
        if (!marcRecord.hasDataField(fieldParsed[0])) {
            return false;
        }
        
        List<MarcDataField> dataFields = marcRecord.getDataFields(fieldParsed[0]);
        
        return dataFields.stream().anyMatch((dataField) -> {
            if (!dataField.hasSubfield(fieldParsed[1])) {
                return false;
            }

            String subfield = dataField.getSubfield(fieldParsed[1]);

            return definition.getName().equals(subfield);
        });
    }
    
    private String[] parseMarcFieldId(String id) throws Exception {
        
        Matcher m = MARC_ID_PATTERN.matcher(id);

        if (m.matches()) {
            if (m.groupCount() == 2) {
                String[] result = new String[2];
                result[0] = m.group(1);
                result[1] = m.group(2);
                return result;
            }
        }
        
        throw new Exception(String.format("The field %s is unable to parse", id));
    }
    
    private String applyGroovyTransformation(String value, String script) {
        Binding binding = new Binding();
        binding.setVariable("field", value);
        GroovyShell shell = new GroovyShell(binding);
        return shell.evaluate(script).toString();
    }
    
    private String getOrDefault(MarcRecord marcRecord, String field, String subfield, String defVal) {
        if (!marcRecord.hasDataField(field)) {
            log.println(String.format("[WARN] following record has no field %s: %s", field, marcRecord));
            return defVal;
        }
        
        List<MarcDataField> dataFields = marcRecord.getDataFields(field);
        
        for (MarcDataField dataField : dataFields) {
            if (dataField.hasSubfield(subfield)) {
                return dataField.getSubfield(subfield);
            }
        }
        
        log.println(String.format("[WARN] following record has no subfield %s%s: %s", field, subfield, marcRecord));
        
        return defVal;
    }
    
}
