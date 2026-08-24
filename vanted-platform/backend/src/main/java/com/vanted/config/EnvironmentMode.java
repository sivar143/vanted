package com.vanted.config;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class EnvironmentMode {
    private final Environment environment;

    public EnvironmentMode(Environment environment) {
        this.environment = environment;
    }

    public String name() {
        return environment.getProperty("vanted.env", "local");
    }

    public boolean isLocal() {
        return Boolean.parseBoolean(environment.getProperty("vanted.local-mode", "true"));
    }

    public boolean isTest() {
        return Boolean.parseBoolean(environment.getProperty("vanted.test-mode", "false"));
    }

    public boolean isProduction() {
        return Boolean.parseBoolean(environment.getProperty("vanted.production-features", "false"));
    }

    public boolean isKubernetesEnabled() {
        return Boolean.parseBoolean(environment.getProperty("vanted.kubernetes-enabled", "false"));
    }
}
