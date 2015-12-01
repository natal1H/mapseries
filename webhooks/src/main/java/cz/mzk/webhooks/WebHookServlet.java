package cz.mzk.webhooks;

import cz.mzk.ActionPerformer;
import cz.mzk.tools.FormatTransformer;
import cz.mzk.tools.GeoServer;
import cz.mzk.tools.Github;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/*")
public class WebHookServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException {
        if (httpServletRequest.getPathInfo().endsWith("push")) {
            ActionPerformer.cloneAndTransformGeoJsonToShp();
        }
    }
}
