package cz.mzk.mapseries.rest;

import java.util.Objects;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
public class ContentDefinitionUpdate {
    
    private String commitMessage;
    
    private String content;

    public String getCommitMessage() {
        return commitMessage;
    }

    public void setCommitMessage(String commitMessage) {
        this.commitMessage = commitMessage;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 89 * hash + Objects.hashCode(this.commitMessage);
        hash = 89 * hash + Objects.hashCode(this.content);
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final ContentDefinitionUpdate other = (ContentDefinitionUpdate) obj;
        if (!Objects.equals(this.commitMessage, other.commitMessage)) {
            return false;
        }
        if (!Objects.equals(this.content, other.content)) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "ContentDefinitionUpdate{" + "commitMessage=" + commitMessage + ", content=" + content + '}';
    }
    
}
