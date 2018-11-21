package cz.mzk.mapseries.jsf.beans;

import cz.mzk.mapseries.Constants;
import cz.mzk.mapseries.dao.AdminDAO;
import cz.mzk.mapseries.dao.AdminManager;
import cz.mzk.mapseries.github.GithubService;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.SessionScoped;
import javax.faces.bean.ViewScoped;
import javax.faces.context.FacesContext;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import org.jboss.logging.Logger;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
@ManagedBean
@SessionScoped
@ViewScoped
public class User implements Serializable {
    
    private static final Logger LOG = Logger.getLogger(User.class);
    
    private static final String LANG_KEY = "lang";
    
    private static final List<String> SUPPORTED_LOCALES = Arrays.asList("cs", "en");
    
    private final FacesContext context = FacesContext.getCurrentInstance();
    
    @Inject
    private GithubService githubService;
    
    @EJB
    private AdminManager adminManager;
    
    private String code;
    
    @PostConstruct
    public void init() {
        context.getViewRoot().setLocale(Locale.forLanguageTag(getLang()));
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
        
        if (this.code != null) {
            try {
                githubService.authenticate(code);
                removeCodeParamAndRedirect();
            } catch (Exception e) {
                LOG.error(e.getMessage(), e);
            }
        }
    }
    
    public String getLang() {
        String lang = (String) context.getExternalContext().getSessionMap().get(LANG_KEY);
        return lang != null ? lang : "cs";
    }
    
    public void setLang(String lang) {
        if (lang != null && !lang.isEmpty()) {
            context.getExternalContext().getSessionMap().put(LANG_KEY, lang);
            if (SUPPORTED_LOCALES.contains(lang)) {
                context.getViewRoot().setLocale(Locale.forLanguageTag(lang));
            }
        }
    }
    
    public boolean isAuthenticate() {
        return githubService.isAuthenticate();
    }
    
    public String getAuthURL() {
        
        HttpServletRequest servletRequest = (HttpServletRequest) context.getExternalContext().getRequest();
        
        String requestUrl = servletRequest.getRequestURL().toString();
        Map<String, List<String>> params = getRequestParams();
        
        LOG.debugf("getAuthURL: requestUrl=%s", requestUrl);
        LOG.debugf("getAuthURL: params=%s", params);
        
        String redirectUri = context.getExternalContext().encodeRedirectURL(requestUrl, params);
        
        LOG.debugf("getAuthURL: redirectUri=%s", redirectUri);
        
        List<String> redirectUriParam = new ArrayList<>();
        redirectUriParam.add(redirectUri);
        params.put("redirect_uri", redirectUriParam);
        
        List<String> clientIdParam = new ArrayList<>();
        clientIdParam.add(Constants.GITHUB_CLIENT_ID);
        params.put("client_id", clientIdParam);
        
        List<String> scopeParam = new ArrayList<>();
        scopeParam.add("user:email");
        scopeParam.add("public_repo");
        params.put("scope", scopeParam);
        
        String authUrlBase = "https://github.com/login/oauth/authorize";
        String authUrl = context.getExternalContext().encodeRedirectURL(authUrlBase, params);
        
        LOG.debugf("Authentication url = %s", authUrl);
        
        return authUrl;
    }

    public String getLogoutUrl() {
        
        try {
            HttpServletRequest servletRequest = (HttpServletRequest) context.getExternalContext().getRequest();
            String contextPath = context.getExternalContext().getRequestContextPath();

            String requestUrl = servletRequest.getRequestURL().toString();
            Map<String, List<String>> params = getRequestParams();

            String redirectUri = context.getExternalContext().encodeRedirectURL(requestUrl, params);
            
            Map<String, List<String>> paramsNew = new HashMap<>();
            List<String> redirectUriParam = new ArrayList<>();
            redirectUriParam.add(redirectUri);
            paramsNew.put("redirect_uri", redirectUriParam);
            return context.getExternalContext().encodeRedirectURL(contextPath + "/logout", paramsNew);
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
        }
        return "#";
    }
    
    public String getLangUrl(String lang) {
        try {
            HttpServletRequest servletRequest = (HttpServletRequest) context.getExternalContext().getRequest();

            String requestUrl = servletRequest.getRequestURL().toString();
            Map<String, List<String>> params = getRequestParams();
            
            List<String> langParam = new ArrayList<>();
            langParam.add(lang);
            params.put("lang", langParam);
            return context.getExternalContext().encodeRedirectURL(requestUrl, params);
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
        }
        return "#";
    }
    
    public String getLangUrlMap() {
        
        String result = getLanguages()
                .stream()
                .map(lang -> String.format("'%s': '%s'", lang, getLangUrl(lang)))
                .collect(Collectors.joining(", "));
        
        return String.format("{%s}", result);
        
    }
    
    public List<String> getLanguages() {
        String currentLang = getLang();
        List<String> result = new ArrayList<>();
        for (String lang : SUPPORTED_LOCALES) {
            if (!lang.equals(currentLang)) {
                result.add(lang);
            }
        }
        return result;
    }
    
    public List<String> getAllLanguages() {
        return SUPPORTED_LOCALES;
    }
    
    public String getTranslatedLangKey(String lang) {
        return "translatedLang-" + lang;
    }
    
    public String getUserName() {
        return githubService.getUserName();
    }
    
    public String getLogin() {
        return githubService.getLogin();
    }
    
    public boolean isAdmin() {
        return githubService.isAdmin();
    }
    
    public List<AdminDAO> getAdmins() {
        return adminManager.getAdmins();
    }
    
    /**
     * This method removes code paramater from URL which is passed by Github
     * and it is not needed anymore.
     */
    private void removeCodeParamAndRedirect() {
        try {
            
            String contextPath = context.getExternalContext().getRequestContextPath();
            String servletPath = context.getExternalContext().getRequestServletPath();
            String path = contextPath + "/" + servletPath;
            Map<String, List<String>> params = getRequestParams("code");
            
            String redirectUrl = context.getExternalContext().encodeRedirectURL(path, params);
            
            LOG.debugf("Path: %s", path);
            LOG.debugf("Redirecting to %s", redirectUrl);
            
            context.getExternalContext().redirect(redirectUrl);

        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
        }
    }
    
    private Map<String, List<String>> getRequestParams(String... excludes) {
        Map<String, String> requestParams = context.getExternalContext().getRequestParameterMap();
        Map<String, List<String>> params = new HashMap<>();
        Set<String> excludesSet = new HashSet<>(Arrays.asList(excludes));
        
        LOG.debugf("Getting request params: params=%s, excludes=%s", requestParams, excludesSet);
        
        for (Map.Entry<String, String> entry : requestParams.entrySet()) {
            if (!excludesSet.contains(entry.getKey())) {
                List<String> value = new ArrayList<>();
                value.add(entry.getValue());
                params.put(entry.getKey(), value);
            }
        }
        
        return params;
    }
    
}
