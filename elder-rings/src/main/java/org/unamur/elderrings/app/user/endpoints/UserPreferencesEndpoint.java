package org.unamur.elderrings.app.user.endpoints;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.RestResponse;
import org.unamur.elderrings.app.core.Routes;
import org.unamur.elderrings.app.user.dto.UserPreferencesDto;
import org.unamur.elderrings.app.user.mappers.UserPreferencesDtoMapper;
import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.user.api.GetUserPreferences;
import org.unamur.elderrings.modules.user.api.SaveUserPreferences;

import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j 
@RequiredArgsConstructor
@Tag(name = "UserPreferences")
@Path(Routes.USER_PREFERENCES_REST_ENDPOINT)
public class UserPreferencesEndpoint {

    private final ConnectedUser connectedUser;
    private final GetUserPreferences getUserPreferences;
    private final SaveUserPreferences saveUserPreferences;

    @GET
    @PermitAll
    @Operation(operationId = "getCurrentUserPreferences")
    public UserPreferencesDto getCurrentUserPreferences() {
        var preferences = getUserPreferences.getPreferencesForUser(connectedUser.getId());
        return UserPreferencesDtoMapper.toDto(preferences);
    }

    @PUT
    @PermitAll
    @Operation(operationId = "updateCurrentUserPreferences")
    public RestResponse<Void> updateCurrentUserPreferences(UserPreferencesDto dto) {
        var model = UserPreferencesDtoMapper.toModel(dto, connectedUser.getId());
        saveUserPreferences.savePreferences(connectedUser.getId(), model);
        return RestResponse.ok();
    }
}
