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
import jakarta.ws.rs.core.Response;

@Path("/webauthn")
public class WebAuthnLoginResource {

  @Inject
  OidcAppConfig oidcAppConfig;

  @GET
  @Produces(MediaType.TEXT_HTML)
  public Response redirectToPasskeyLogin() {
    Log.info("Redirecting to key only auth");

    String redirectUri = oidcAppConfig.applications().get(0).client().redirectUris().get(0);
    String encodedRedirectUri = URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);
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