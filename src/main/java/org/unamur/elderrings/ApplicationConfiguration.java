package org.unamur.elderrings;

import io.quarkus.runtime.annotations.StaticInitSafe;
import io.smallrye.config.ConfigMapping;
import io.smallrye.config.WithName;

@StaticInitSafe
@ConfigMapping(prefix = "app")
public interface ApplicationConfiguration {

    @WithName("info")
    Info getInfo();


    public interface Info {

        @WithName("env")
        String getEnv();

    }
}