package org.unamur.elderrings.app.user.endpoints;

import java.util.UUID;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.unamur.elderrings.app.core.Routes;
import org.unamur.elderrings.app.user.dto.UserPreferencesDto;
import org.unamur.elderrings.app.user.mappers.UserPreferencesDtoMapper;
import org.unamur.elderrings.modules.authentication.services.ConnectedUser;
import org.unamur.elderrings.modules.user.api.GetUserPreferences;
import org.unamur.elderrings.modules.user.api.ResidentAccessPolicy;
import org.unamur.elderrings.modules.user.api.SaveUserPreferences;

import io.quarkus.security.ForbiddenException;
import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
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
    private final ResidentAccessPolicy residentAccessPolicy;

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
    public UserPreferencesDto updateCurrentUserPreferences(UserPreferencesDto dto) {
        var model = UserPreferencesDtoMapper.toModel(dto, connectedUser.getId());
        saveUserPreferences.savePreferences(connectedUser.getId(), model);
        return UserPreferencesDtoMapper.toDto(model);
    }

    @GET
    @Path("/of-user")
    @PermitAll // Guard is managed in the route by the ResidentAccessPolicy
    @Operation(operationId = "getUserPreferences")
    public UserPreferencesDto getPreferencesOfUser(@QueryParam("userId") UUID userId) {
        if (!residentAccessPolicy.canManage(userId)) {
            throw new ForbiddenException("Not allowed to manage this resident's preferences");
        }

        return UserPreferencesDtoMapper.toDto(getUserPreferences.getPreferencesForUser(userId));
    }

    @PUT
    @Path("/of-user")
    @PermitAll // Guard is managed in the route by the ResidentAccessPolicy
    @Operation(operationId = "updateUserPreferences")
    public UserPreferencesDto updatePreferencesOfUser(@QueryParam("userId") UUID userId, UserPreferencesDto dto) {
        if (!residentAccessPolicy.canManage(userId)) {
            throw new ForbiddenException("Not allowed to manage this resident's preferences");
        }

        var model = UserPreferencesDtoMapper.toModel(dto, userId);
        saveUserPreferences.savePreferences(userId, model);
        return UserPreferencesDtoMapper.toDto(model);
    }
}
