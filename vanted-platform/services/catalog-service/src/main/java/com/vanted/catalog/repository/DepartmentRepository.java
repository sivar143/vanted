package com.vanted.catalog.repository;
import com.vanted.catalog.domain.Department;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DepartmentRepository extends JpaRepository<Department,Long>{ boolean existsByNameIgnoreCase(String name); }