package org.unamur.elderrings.utils;

import java.util.Collection;

import lombok.experimental.UtilityClass;

@UtilityClass
public class ValidationUtils {
    
    public boolean isNotEmpty(String value) {
        return value != null && !value.isEmpty();
    }

    public boolean isNotEmpty(Collection<?> value) {
        return value != null && !value.isEmpty();
    }
}
