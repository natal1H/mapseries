package cz.mzk.mapseries.update;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.util.List;
import java.util.Optional;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
public class UpdateTaskResult {
    
    private final Optional<List<Object>> data;
    
    private final File logFile;
    
    public UpdateTaskResult(File logFile, List<Object> data) {
        this.logFile = logFile;
        this.data = Optional.of(data);
    }
    
    public UpdateTaskResult(File logFile) {
        this.logFile = logFile;
        this.data = Optional.empty();
    }

    public Optional<List<Object>> getData() {
        return data;
    }

    public File getLogFile() {
        return logFile;
    }
    
    public long getLogSize() {
        try (Reader reader = new FileReader(logFile)) {
            
            long count = 0;
            long read;
            
            while ((read = reader.skip(Long.MAX_VALUE)) != 0) {
                count += read;
            }
            
            return count;
            
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    
}
