package cz.mzk.mapseries.oai.marc;

import java.util.HashMap;
import java.util.Map;

/**
 * @author Erich Duda <dudaerich@gmail.com>
 */
public class MarcRecord {

    private Map<String, String> controlFields = new HashMap<>();

    private Map<String, MarcDataField> dataFields = new HashMap<>();

    public void addControlField(String tag, String value) {
        controlFields.put(tag, value);
    }

    public boolean hasControlField(String tag) {
        return controlFields.containsKey(tag);
    }

    public String getControlField(String tag) {
        return controlFields.get(tag);
    }

    public void addDataField(String tag, MarcDataField dataField) {
        dataFields.put(tag, dataField);
    }

    public boolean hasDataField(String tag) {
        return dataFields.containsKey(tag);
    }

    public MarcDataField getDataField(String tag) {
        return dataFields.get(tag);
    }

    @Override
    public String toString() {
        return "MarcRecord{" +
                "controlFields=" + controlFields +
                ", dataFields=" + dataFields +
                '}';
    }
}
