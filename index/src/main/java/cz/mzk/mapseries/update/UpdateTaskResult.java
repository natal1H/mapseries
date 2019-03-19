package cz.mzk.mapseries.update;

import cz.mzk.mapseries.dao.interfaces.VersionedData;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.util.List;
import java.util.Optional;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
class UpdateTaskResult {
    
    private final Optional<List<VersionedData>> data;
    
    private final File logFile;
    
    UpdateTaskResult(File logFile, List<VersionedData> data) {
        this.logFile = logFile;
        this.data = Optional.of(data);
    }
    
    UpdateTaskResult(File logFile) {
        this.logFile = logFile;
        this.data = Optional.empty();
    }

    Optional<List<VersionedData>> getData() {
        return data;
    }

    File getLogFile() {
        return logFile;
    }
    
    long getLogSize() {
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
