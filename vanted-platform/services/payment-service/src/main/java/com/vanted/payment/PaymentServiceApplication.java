package com.vanted.payment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class PaymentServiceApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(PaymentServiceApplication.class);
        app.addInitializers(context -> validateEnvironment(context.getEnvironment()));
        app.run(args);
    }

    private static void validateEnvironment(Environment environment) {
        String env = environment.getProperty("VANTED_ENV", "local");
        String paymentMode = environment.getProperty("VANTED_PAYMENT_MODE", "mock");
        boolean productionFeatures = Boolean.parseBoolean(
                environment.getProperty("VANTED_PRODUCTION_FEATURES", "false"));

        if ("live".equalsIgnoreCase(paymentMode)
                && !("production".equalsIgnoreCase(env) && productionFeatures)) {
            throw new IllegalStateException(
                    "VANTED_PAYMENT_MODE=live is only allowed when VANTED_ENV=production "
                            + "and VANTED_PRODUCTION_FEATURES=true.");
        }
    }
}
