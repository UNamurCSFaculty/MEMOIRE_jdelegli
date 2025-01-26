package org.acme.getting.started;

import org.unamur.elderrings.modules.authentication.services.ConnectedUser;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Path("/hello")
@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class GreetingResource {

    private final GreetingService service;

    private final ConnectedUser user;

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/greeting/{name}")
    public String greeting(String name) {
        return service.greeting(name);
    }

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String hello() {
      // JsonWebToken principal = (JsonWebToken) identity.getPrincipal();

      // // Log all claims
      // principal.getClaimNames().forEach(claim -> 
      //   log.info("Claim: {} = {}", claim, principal.getClaim(claim))
      // );

      // // Access fields from the token
      // String username = principal.getName(); // `name` field
      // String email = principal.getClaim("email"); // Custom claim
      // String id = principal.getSubject(); // Custom claim
      // String givenName = principal.getClaim("given_name");
      // String familyName = principal.getClaim("family_name");

      // log.info("principal: {}", principal);

      // log.info("User details: username={}, email={}, givenName={}, familyName={}, id={}", username, email, givenName, familyName, id);

      return "Hello " + user.getUsername();
    }
}