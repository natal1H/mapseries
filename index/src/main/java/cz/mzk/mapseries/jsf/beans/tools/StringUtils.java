package cz.mzk.mapseries.jsf.beans.tools;

import javax.enterprise.inject.Model;

@Model
public final class StringUtils {

    public static String shortenWords(String str, int maxLength) {

        StringBuilder result = new StringBuilder();
        int wordLength = 0;

        for (int i = 0; i < str.length(); i++) {

            char c = str.charAt(i);

            if (Character.isAlphabetic(c)) {

                if (wordLength < maxLength) {
                    result.append(c);
                } else if (wordLength == maxLength) {
                    result.append("...");
                }

                wordLength++;

            } else {
                wordLength = 0;
                result.append(c);
            }

        }

        return result.toString();

    }

}
