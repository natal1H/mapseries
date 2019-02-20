package cz.mzk.mapseries.github;

import java.io.IOException;
import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.jboss.logging.Logger;
import org.json.JSONObject;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@WebServlet("/server/authenticate/*")
public class AuthenticateProxyServlet extends HttpServlet {
    
    private final static Logger LOG = Logger.getLogger(AuthenticateProxyServlet.class);
    
    @Inject
    private GithubService githubService;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        try {
            String code = req.getPathInfo().replaceFirst("^\\/", "");
            
            String githubToken = githubService.authenticate(code);
            
            JSONObject jsonResp = new JSONObject();
            jsonResp.put("token", githubToken);
            jsonResp.write(resp.getWriter());

        } catch (Exception e) {
            JSONObject jsonResp = new JSONObject();
            jsonResp.put("error", e.getMessage());
            jsonResp.write(resp.getWriter());
        } finally {
            resp.addHeader("Content-Type", "application/json");
        }
    }
    
}
