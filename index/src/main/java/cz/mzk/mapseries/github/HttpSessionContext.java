package cz.mzk.mapseries.github;

import java.util.Map;
import javax.servlet.http.HttpSession;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
public class HttpSessionContext {
    
    private Map<String, Object> sessionMap;
    
    private HttpSession httpSession;
    
    public static HttpSessionContext fromHttpSession(HttpSession httpSession) {
        return new HttpSessionContext(httpSession);
    }
    
    private HttpSessionContext(Map<String, Object> sessionMap) {
        this.sessionMap = sessionMap;
    }
    
    private HttpSessionContext(HttpSession httpSession) {
        this.httpSession = httpSession;
    }
    
    public boolean hasAttribute(String name) {
        if (sessionMap != null) {
            return sessionMap.containsKey(name);
        } else if (httpSession != null) {
            return httpSession.getAttribute(name) != null;
        } else {
            throw new IllegalStateException("Both sessionMap and httpSession are null");
        }
    }
    
    public Object getAttribute(String name) {
        if (sessionMap != null) {
            return sessionMap.get(name);
        } else if (httpSession != null) {
            return httpSession.getAttribute(name);
        } else {
            throw new IllegalStateException("Both sessionMap and httpSession are null");
        }
    }
    
    public void setAttribute(String name, Object value) {
        if (sessionMap != null) {
            sessionMap.put(name, value);
        } else if (httpSession != null) {
            httpSession.setAttribute(name, value);
        } else {
            throw new IllegalStateException("Both sessionMap and httpSession are null");
        }
    }
    
    public void removeAttribute(String name) {
        if (sessionMap != null) {
            sessionMap.remove(name);
        } else if (httpSession != null) {
            httpSession.removeAttribute(name);
        } else {
            throw new IllegalStateException("Both sessionMap and httpSession are null");
        }
    }
    
}
