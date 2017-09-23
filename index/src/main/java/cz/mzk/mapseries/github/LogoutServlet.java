package cz.mzk.mapseries.github;

import java.io.IOException;
import javax.enterprise.context.SessionScoped;
import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@WebServlet("/logout")
@SessionScoped
public class LogoutServlet extends HttpServlet {
    
    @Inject
    private GithubService githubService;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        
        githubService.logout();
        
        String redirectUri = req.getParameter("redirect_uri");
        if (redirectUri != null && !redirectUri.isEmpty()) {
            resp.sendRedirect(redirectUri);
        } else {
            resp.sendRedirect(req.getContextPath());
        }
    }
    
}
