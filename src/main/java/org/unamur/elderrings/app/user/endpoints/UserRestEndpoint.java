package org.unamur.elderrings.app.user.endpoints;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.RestResponse;
import org.unamur.elderrings.app.core.Routes;
import org.unamur.elderrings.app.user.dto.UserDto;
import org.unamur.elderrings.app.user.mappers.UserMapper;
import org.unamur.elderrings.modules.user.api.SetUserPicture;
import org.unamur.elderrings.modules.user.api.UpdateUserFromToken;

import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Tag(name = "User")
@Path(Routes.USER_REST_ENDPOINT)
public class UserRestEndpoint {

  private final UpdateUserFromToken updateUserFromToken;
  private final SetUserPicture setUserPicture;

  @GET
  @Path("/me")
  @Operation(operationId = "getCurrentUser")
  @PermitAll
  public RestResponse<UserDto> getCurrentUser(){
    UserDto dto = UserMapper.toDto(updateUserFromToken.createOrUpdateUser());
    return RestResponse.ok(dto);
  }

  @POST
  @Path("/{userId}/set-picture")
  @Operation(operationId = "setUserPicture")
  @PermitAll
  public RestResponse<UUID> uploadProfilePicture(@PathParam("userId") UUID userId, @RestForm File file) throws IOException, BadRequestException {

    if (file == null) {
      throw new BadRequestException("File not found");
    }
    // Extract the file from the form data
    byte[] imageBytes = java.nio.file.Files.readAllBytes(file.toPath());

    // Call the repository to set the user picture
    UUID pictureId = setUserPicture.setPicture(userId, imageBytes);

    // Return the picture ID as a response
    return RestResponse.ok(pictureId);
  }
  
}
