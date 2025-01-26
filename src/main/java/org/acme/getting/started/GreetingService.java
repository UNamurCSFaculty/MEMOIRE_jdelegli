package org.acme.getting.started;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.extern.slf4j.Slf4j;

@ApplicationScoped
@Slf4j
public class GreetingService {
  

    public String greeting(String name) {
        return "hello " + name;
    }

}
