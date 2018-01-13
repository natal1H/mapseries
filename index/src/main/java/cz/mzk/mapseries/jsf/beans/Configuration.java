package cz.mzk.mapseries.jsf.beans;

import cz.mzk.mapseries.github.GithubService;
import cz.mzk.mapseries.update.UpdateEJB;
import cz.mzk.mapseries.update.dao.UpdateTaskDAO;
import cz.mzk.mapseries.update.UpdateTaskManager;
import java.time.Duration;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import javax.ejb.EJB;
import javax.enterprise.inject.Model;
import javax.inject.Inject;
import org.apache.commons.lang.time.DurationFormatUtils;
import org.jboss.logging.Logger;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@Model
public class Configuration {
    
    private static final Logger LOG = Logger.getLogger(Configuration.class);
    
    public static final String CONTENT_DEFINITION_PATH = "content-definition.json";
    
    private Long updateTaskId;
    
    @Inject
    private GithubService githubService;
    
    @EJB
    private UpdateTaskManager updateTaskManager;
    
    @EJB
    private UpdateEJB updateEJB;

    public Long getUpdateTaskId() {
        return updateTaskId;
    }

    public void setUpdateTaskId(Long updateTaskId) {
        this.updateTaskId = updateTaskId;
    }
    
    public UpdateTaskDAO getUpdateTask() {
        if (updateTaskId == null) {
            return null;
        }
        return updateTaskManager.findById(updateTaskId);
    }
    
    public String getContentDefinitionData() {
        String data = null;
        
        try {
            data = githubService.loadFile("/" + CONTENT_DEFINITION_PATH);
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
        }
        
        if (data == null) {
            return "null";
        } else {
            return data;
        }
    }
    
    public List<UpdateTaskDAO> getUpdateTasks() {
        return updateTaskManager.getTasks(10);
    }
    
    public String computeDuration(UpdateTaskDAO task) {
        if (task.getStartDate() == null || task.getEndDate() == null) {
            return "";
        }
        Duration duration = Duration.between(task.getStartDate(), task.getEndDate());
        return DurationFormatUtils.formatDuration(duration.getSeconds() * 1000, "HH:mm:ss");
    }
    
    public String formatDate(ZonedDateTime date) {
        if (date == null) {
            return "";
        }
        return DateTimeFormatter.ofPattern("dd. MM. yyyy - HH:mm:ss", Locale.forLanguageTag("cs")).format(date);
    }
    
    public String printStatusOfTask(UpdateTaskDAO task) {
        if (task.equals(updateEJB.getRunningTask())) {
            return "running";
        }
        if (task.getStartDate() == null) {
            return "scheduled";
        }
        if (task.isResult()) {
            return "passed";
        } else {
            return "failed";
        }
    }
}
