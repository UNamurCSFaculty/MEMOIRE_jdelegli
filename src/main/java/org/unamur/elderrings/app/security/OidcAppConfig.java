package org.unamur.elderrings.app.security;


import io.smallrye.config.ConfigMapping;

import java.util.List;

@ConfigMapping(prefix = "quarkus.oidc")
public interface OidcAppConfig {
    String authServerUrl();
    String clientId();
    List<Application> applications();

    interface Application {
        Client client();
    }

    interface Client {
        List<String> redirectUris();
    }
}