package com.vanted.catalog.repository;

import com.vanted.catalog.domain.ServiceOffering;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceOfferingRepository extends JpaRepository<ServiceOffering, UUID> {
    List<ServiceOffering> findAllByActiveTrueOrderByNameAsc();
}
