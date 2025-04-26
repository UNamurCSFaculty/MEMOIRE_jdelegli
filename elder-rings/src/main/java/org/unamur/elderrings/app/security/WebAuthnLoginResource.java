package org.unamur.elderrings.app.security;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import io.quarkus.logging.Log;
import jakarta.ws.rs.core.MediaType;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Response;

@Path("/webauthn")
public class WebAuthnLoginResource {

  @Inject
  OidcAppConfig oidcAppConfig;

  @GET
  @Produces(MediaType.TEXT_HTML)
  public Response redirectToPasskeyLogin(@QueryParam("roomId") String roomId) {
    Log.infof("Redirecting to key-only auth%s", 
        (roomId != null && !roomId.isBlank()) ? " for room " + roomId : "");

    String baseRedirectUri = oidcAppConfig.applications().get(0).client().redirectUris().get(0);
    String finalRedirectUri = (roomId != null && !roomId.isBlank())
            ? baseRedirectUri + "call-room/" + roomId
            : baseRedirectUri ;
    String encodedRedirectUri = URLEncoder.encode(finalRedirectUri, StandardCharsets.UTF_8);
    String clientId = oidcAppConfig.clientId() + "-webauthn";
    String authUrl = oidcAppConfig.authServerUrl() + "/protocol/openid-connect/auth";

    URI uri = URI.create(authUrl+
      "?client_id=" + clientId +
      "&response_type=code" +
      "&scope=openid" +
      "&redirect_uri=" + encodedRedirectUri +
      "&kc_idp_hint=webauthn");

    return Response.seeOther(uri).build();
  }
}