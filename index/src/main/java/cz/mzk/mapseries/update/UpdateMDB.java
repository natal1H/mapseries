package cz.mzk.mapseries.update;

import cz.mzk.mapseries.managers.UpdateTaskManager;
import cz.mzk.mapseries.dao.UpdateTaskDAO;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.sql.Clob;
import java.time.ZonedDateTime;
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
import org.hibernate.Session;
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
            long taskId = msg.getLongProperty(UpdateEJB.TASK_ID_KEY);
            UpdateTaskDAO updateTaskDAO = updateTaskManager.findById(taskId);
            updateTaskDAO.setStartDate(ZonedDateTime.now());
                
            UpdateTaskResult result = updateEJB.runUpdateTask(updateTaskDAO, msg.getBody(String.class));
            
            // Only if the task passed, persist the series
            if (result.getData().isPresent()) {
                updateTaskDAO.setResult(true);
                em.createQuery("DELETE FROM SheetDAO").executeUpdate();
                em.createQuery("DELETE FROM DescriptionDAO").executeUpdate();
                em.createQuery("DELETE FROM SerieDAO").executeUpdate();
                result.getData().get().forEach(d -> em.merge(d));
            } else {
                updateTaskDAO.setResult(false);
            }
            
            Session session = em.unwrap(Session.class);
            
            try {
                Reader reader = new FileReader(result.getLogFile());
                Clob clob = session.getLobHelper().createClob(reader, result.getLogSize());
                updateTaskDAO.setLog(clob);
            } catch (IOException e) {
                throw new RuntimeException(e);
            } finally {
                result.getLogFile().delete();
            }
            
            updateTaskDAO.setEndDate(ZonedDateTime.now());
            
            context.createProducer().send(topic, context.createMessage());
            
        } catch (JMSException e) {
            LOG.error(e.getMessage(), e);
        }
    }
    
}
