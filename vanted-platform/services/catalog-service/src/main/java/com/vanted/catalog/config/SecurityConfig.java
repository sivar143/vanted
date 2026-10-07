package com.vanted.catalog.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
 @Bean SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
   return http.csrf(AbstractHttpConfigurer::disable).authorizeHttpRequests(a->a.requestMatchers("/actuator/**").permitAll().anyRequest().authenticated()).oauth2ResourceServer(o->o.jwt(j->j.jwtAuthenticationConverter(jwtAuthenticationConverter()))).build();
 }
 @Bean SecretKey jwtSecretKey(@Value("${VANTED_JWT_SECRET}") String secret){ if(secret==null||secret.length()<32) throw new IllegalStateException("VANTED_JWT_SECRET must contain at least 32 characters"); return new SecretKeySpec(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8),"HmacSHA256");}
 @Bean JwtDecoder jwtDecoder(SecretKey key){return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();}
 @Bean JwtAuthenticationConverter jwtAuthenticationConverter(){var c=new JwtAuthenticationConverter(); c.setJwtGrantedAuthoritiesConverter(jwt-> {String role=jwt.getClaimAsString("role"); return role==null?List.of():List.of(new SimpleGrantedAuthority("ROLE_"+role));}); return c;}
}