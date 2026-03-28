package org.unamur.elderrings.modules.telecommunication.exceptions;

import java.util.Map;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

public class DoNotDisturbException extends WebApplicationException {
    public DoNotDisturbException() {
        super(Response.status(Response.Status.BAD_REQUEST)
                      .entity(Map.of("errorCode", "DO_NOT_DISTURB"))
                      .type(MediaType.APPLICATION_JSON)
                      .build());
    }
}
