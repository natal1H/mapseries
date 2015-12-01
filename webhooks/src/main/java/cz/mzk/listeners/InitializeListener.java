package cz.mzk.listeners;


import cz.mzk.ActionPerformer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

@WebListener
public class InitializeListener implements ServletContextListener {

    private final static Logger logger = LoggerFactory.getLogger(InitializeListener.class);

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        final ScheduledThreadPoolExecutor executor = new ScheduledThreadPoolExecutor(1);
        executor.schedule(new Runnable() {
            @Override
            public void run() {
                ActionPerformer.cloneAndTransformGeoJsonToShp();
            }
        }, 30, TimeUnit.SECONDS);


    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {

    }
}
