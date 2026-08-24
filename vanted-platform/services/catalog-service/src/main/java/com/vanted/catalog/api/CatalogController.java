package com.vanted.catalog.api;

import com.vanted.catalog.domain.ServiceOffering;
import com.vanted.catalog.repository.ServiceOfferingRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog/services")
public class CatalogController {
    private final ServiceOfferingRepository repository;

    public CatalogController(ServiceOfferingRepository repository) { this.repository = repository; }

    @GetMapping
    public List<ServiceResponse> list() {
        return repository.findAllByActiveTrueOrderByNameAsc().stream().map(ServiceResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponse> get(@PathVariable UUID id) {
        return repository.findById(id).filter(ServiceOffering::isActive)
            .map(service -> ResponseEntity.ok(ServiceResponse.from(service)))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record ServiceResponse(UUID id, String name, String description, java.math.BigDecimal price, String category) {
        static ServiceResponse from(ServiceOffering service) {
            return new ServiceResponse(service.getId(), service.getName(), service.getDescription(), service.getPrice(), service.getCategory());
        }
    }
}
