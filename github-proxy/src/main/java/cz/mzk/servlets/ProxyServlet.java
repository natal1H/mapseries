package cz.mzk.servlets;

import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

@WebServlet("/*")
public class ProxyServlet extends HttpServlet {

    private final static Logger logger = LoggerFactory.getLogger(ProxyServlet.class);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            String filePath = req.getPathInfo();
            File repoPath = new File("/moravianlibrary/mapseries-data/master");

            URI githubUri = new URIBuilder()
                    .setScheme("https")
                    .setHost("raw.githubusercontent.com")
                    .setPath(new File(repoPath, filePath).getAbsolutePath())
                    .build();

            CloseableHttpClient httpClient = HttpClients.createDefault();
            HttpGet httpGet = new HttpGet(githubUri);
            CloseableHttpResponse response = httpClient.execute(httpGet);
            response.getEntity().writeTo(resp.getOutputStream());

            if (filePath.endsWith(".js")) {
                response.addHeader("Content-Type", "application/javascript");
            }

        } catch (URISyntaxException e) {
            logger.error("Failed to generate URI.", e);
        }
    }
}
