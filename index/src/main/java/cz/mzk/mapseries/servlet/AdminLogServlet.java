package cz.mzk.mapseries.servlet;

import cz.mzk.mapseries.dao.UpdateTaskDAO;
import cz.mzk.mapseries.managers.UpdateTaskManager;
import java.io.IOException;
import java.sql.SQLException;
import javax.ejb.EJB;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.MediaType;
import org.apache.commons.io.IOUtils;

/**
 * @author Erich Duda <dudaerich@netsuite.com>
 */
@WebServlet("/admin/log")
public class AdminLogServlet extends HttpServlet {
    
    @EJB
    private UpdateTaskManager updateTaskManager;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String taskIdParam = req.getParameter("taskId");
        
        if (taskIdParam == null) {
            throw new IllegalArgumentException("taskId parameter is missing");
        }
        
        long taskId = Long.valueOf(taskIdParam);
        
        UpdateTaskDAO task = updateTaskManager.findById(taskId);
        
        resp.setContentType(MediaType.TEXT_PLAIN);
        resp.setHeader("Content-disposition","attachment; filename=task-" + taskId + ".log");
        
        try {
            IOUtils.copy(task.getLog().getCharacterStream(), resp.getWriter());
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
    
}
