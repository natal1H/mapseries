/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.mzk.mapseries.jsf.beans;

import com.google.common.base.Suppliers;
import cz.mzk.mapseries.managers.ContentDefinitionItem;
import cz.mzk.mapseries.managers.ContentDefinitionManager;
import java.util.List;
import java.util.function.Supplier;
import javax.enterprise.inject.Model;
import javax.inject.Inject;

@Model
public class TextEditor {
    
    private String lang;
    
    private String name;
    
    private final Supplier<ContentDefinitionItem> contentDefinitionItem = Suppliers.memoize(this::contentDefinitionItemLoader);
    
    @Inject
    private ContentDefinitionManager contentDefinitionManager;

    public String getLang() {
        return lang;
    }

    public void setLang(String lang) {
        this.lang = lang;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    
    public String getPrettyName() {
        return contentDefinitionItem.get().getPrettyName();
    }
    
    public String getText() {
        return contentDefinitionItem.get().getDescription(lang).orElse("");
    }
    
    private ContentDefinitionItem contentDefinitionItemLoader() {
        List<ContentDefinitionItem> items = contentDefinitionManager.getDefinitions();
        
        for (ContentDefinitionItem item : items) {
            if (item.getName().equals(name)) {
                return item;
            }
        }
        
        throw new IllegalStateException("The item does not exist: " + name);
    }
    
}
