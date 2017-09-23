package cz.mzk.mapseries.update;

import java.util.HashSet;
import java.util.Set;
import javax.ejb.ActivationConfigProperty;
import javax.ejb.MessageDriven;
import javax.jms.Message;
import javax.jms.MessageListener;
import javax.websocket.OnClose;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import org.jboss.logging.Logger;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@ServerEndpoint("/ws/update")
@MessageDriven(name = "UpdateWebSocketMDB", activationConfig = {
    @ActivationConfigProperty(propertyName = "destinationLookup", propertyValue = "jms/queue/UpdateTasksNotifications"),
    @ActivationConfigProperty(propertyName = "destinationType", propertyValue = "javax.jms.Topic"),
    @ActivationConfigProperty(propertyName = "acknowledgeMode", propertyValue = "Auto-acknowledge")})
public class UpdateWebSocket implements MessageListener {
    
    private static final Logger LOG = Logger.getLogger(UpdateWebSocket.class);
    
    private Set<Session> sessions = new HashSet<>();
    
    @OnOpen
    public void open(Session session) {
        LOG.debug("Opening session");
        sessions.add(session);
    }

    @OnClose
    public void close(Session session) {
        LOG.debug("Closing session");
        sessions.remove(session);
    }

    @Override
    public void onMessage(Message msg) {
        
        LOG.debug("Received notification message.");
        
        for (Session session : sessions) {
            session.getAsyncRemote().sendText("reload");
        }
    }
    
}
