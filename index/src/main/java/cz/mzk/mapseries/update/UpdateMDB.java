package cz.mzk.mapseries.update;

import cz.mzk.mapseries.update.dao.SerieDAO;
import cz.mzk.mapseries.update.dao.UpdateTaskDAO;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.Resource;
import javax.ejb.ActivationConfigProperty;
import javax.ejb.EJB;
import javax.ejb.MessageDriven;
import javax.inject.Inject;
import javax.jms.JMSContext;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageListener;
import javax.jms.Topic;
import javax.persistence.EntityManager;
import org.jboss.logging.Logger;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@MessageDriven(name = "UpdateMDB", activationConfig = {
    @ActivationConfigProperty(propertyName = "destinationLookup", propertyValue = "jms/queue/UpdateTasks"),
    @ActivationConfigProperty(propertyName = "destinationType", propertyValue = "javax.jms.Queue"),
    @ActivationConfigProperty(propertyName = "acknowledgeMode", propertyValue = "Auto-acknowledge"),
    @ActivationConfigProperty(propertyName = "maxSession", propertyValue = "1")})
public class UpdateMDB implements MessageListener {
    
    private static final Logger LOG = Logger.getLogger(UpdateMDB.class);
    
    @EJB
    private UpdateTaskManager updateTaskManager;
    
    @Inject
    private EntityManager em;
    
    @EJB
    private UpdateEJB updateEJB;
    
    @Inject
    private JMSContext context;
    
    @Resource(lookup = "java:/jms/queue/UpdateTasksNotifications")
    private Topic topic;

    @Override
    public void onMessage(Message msg) {
        try {
            long taskId = msg.getLongProperty("taskId");
            UpdateTaskDAO updateTaskDAO = updateTaskManager.findById(taskId);
            updateTaskDAO.setStartDate(ZonedDateTime.now());
            
            List<Object> series = new ArrayList<>();
                
            updateEJB.runUpdateTask(updateTaskDAO, msg.getBody(String.class), series);
            
            // Only if the task passed, persist the series
            if (updateTaskDAO.isResult() == true) {
                em.createQuery("DELETE FROM SheetDAO").executeUpdate();
                em.createQuery("DELETE FROM SerieDAO").executeUpdate();
                series.forEach(serie -> em.merge(serie) );
            }
            
            updateTaskDAO.setEndDate(ZonedDateTime.now());
            
            context.createProducer().send(topic, context.createMessage());
            
        } catch (JMSException e) {
            LOG.error(e.getMessage(), e);
        }
    }
    
}
