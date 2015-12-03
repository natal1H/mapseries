package cz.mzk.servlets;

import org.apache.commons.io.IOUtils;
import org.apache.http.Consts;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/authenticate/*")
public class AuthenticateProxyServlet extends HttpServlet {
    private final static Logger logger = LoggerFactory.getLogger(AuthenticateProxyServlet.class);

    private static final String clientId = System.getenv("GITHUB_CLIENT_ID");
    private static final String clientSecret = System.getenv("GITHUB_CLIENT_SECRET");

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        try {
            String code = req.getPathInfo().replaceFirst("^\\/", "");
            URI githubUri = new URIBuilder()
                    .setScheme("https")
                    .setHost("github.com")
                    .setPath("/login/oauth/access_token")
                    .build();

            List<NameValuePair> params = new ArrayList<>();
            params.add(new BasicNameValuePair("client_id", clientId));
            params.add(new BasicNameValuePair("client_secret", clientSecret));
            params.add(new BasicNameValuePair("code", code));
            UrlEncodedFormEntity entity = new UrlEncodedFormEntity(params, Consts.UTF_8);
            HttpPost httpPost = new HttpPost(githubUri);
            httpPost.setEntity(entity);
            httpPost.addHeader("Accept", "application/json");
            httpPost.addHeader("Accept-Charset", "utf-8");
            CloseableHttpClient httpClient = HttpClients.createDefault();
            CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

            String jsonString = IOUtils.toString(
                    httpResponse.getEntity().getContent(),
                    "UTF-8");
            JSONObject jsonObject = new JSONObject(jsonString);
            if (jsonObject.has("access_token")) {
                String accessToken = jsonObject.getString("access_token");
                JSONObject jsonResp = new JSONObject();
                jsonResp.put("token", accessToken);
                jsonResp.write(resp.getWriter());
            } else {
                String error = jsonObject.optString("error", "Unexpected error");
                JSONObject jsonResp = new JSONObject();
                jsonResp.put("error", error);
                jsonResp.write(resp.getWriter());
            }
            resp.addHeader("Content-Type", "application/json");

        } catch (URISyntaxException e) {
            logger.error("Failed to generate URI.", e);
        }
    }
}
