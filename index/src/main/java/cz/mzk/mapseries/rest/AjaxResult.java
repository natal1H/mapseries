package cz.mzk.mapseries.rest;

import java.util.Objects;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
public class AjaxResult {
    
    private boolean success;
    
    private String message;
    
    public AjaxResult() {
        success = true;
        message = "";
    }
    
    public AjaxResult(boolean result, String message) {
        this.success = result;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "AjaxResult{" + "success=" + success + ", message=" + message + '}';
    }

    @Override
    public int hashCode() {
        int hash = 3;
        hash = 97 * hash + (this.success ? 1 : 0);
        hash = 97 * hash + Objects.hashCode(this.message);
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
        final AjaxResult other = (AjaxResult) obj;
        if (this.success != other.success) {
            return false;
        }
        if (!Objects.equals(this.message, other.message)) {
            return false;
        }
        return true;
    }
    
}
