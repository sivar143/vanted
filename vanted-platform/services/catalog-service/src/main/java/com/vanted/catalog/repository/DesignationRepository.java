package com.vanted.catalog.repository;
import com.vanted.catalog.domain.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface DesignationRepository extends JpaRepository<Designation,Long>{ List<Designation> findAllByOrderByNameAsc(); boolean existsByDepartmentIdAndNameIgnoreCase(Long departmentId,String name); long countByDepartmentId(Long departmentId); }