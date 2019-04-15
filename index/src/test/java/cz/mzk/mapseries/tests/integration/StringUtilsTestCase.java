package cz.mzk.mapseries.tests.integration;

import cz.mzk.mapseries.jsf.beans.tools.StringUtils;
import org.junit.Assert;
import org.junit.Test;

public class StringUtilsTestCase {

    @Test
    public void shortenWordsTest() {

        String input = "Baňská Bystrica (Neusohl - Beszterczebánya).";
        String expected = "Baňská Bystrica (Neusohl - Besztercze...).";

        Assert.assertEquals(expected, StringUtils.shortenWords(input, 10));

    }

}
