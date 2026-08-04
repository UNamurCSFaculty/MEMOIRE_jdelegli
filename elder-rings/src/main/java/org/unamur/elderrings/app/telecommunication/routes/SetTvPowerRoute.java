package org.unamur.elderrings.app.telecommunication.routes;

import org.jboss.resteasy.reactive.RestResponse;
import org.unamur.elderrings.app.telecommunication.bodies.SetTvPowerBody;
import org.unamur.elderrings.modules.telecommunication.api.SetTvPowerInterface;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class SetTvPowerRoute {

    private final SetTvPowerInterface setTvPowerInterface;

    public RestResponse<Void> setTvPower(SetTvPowerBody body) {

        // perform business logic
        setTvPowerInterface.setTvPower(body.getOn());

        return RestResponse.ok();

    }

}