package org.unamur.elderrings.modules.shared.models;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
public abstract class SocketMessage<T> {
    
    @NotNull
    protected String type;

    @NotNull 
    protected T value;
}
