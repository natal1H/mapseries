package cz.mzk.mapseries.github;

import cz.mzk.mapseries.Constants;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import javax.ejb.Stateless;
import javax.jms.Connection;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@Stateless
public class GithubServiceUnauthorized {
    
    public String loadFile(String path) throws Exception {
        URL url = new URL(String.format("https://raw.githubusercontent.com/%s/%s/master/%s", Constants.REPO_USER, Constants.REPO_NAME, path));
        URLConnection connection = url.openConnection();
        
        try (InputStream is = connection.getInputStream()) {
            BufferedReader reader = new BufferedReader(new InputStreamReader(is));
            StringBuilder sb = new StringBuilder();
            String line;
            
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            
            return sb.toString();
        }
    }
    
}
