package com.vanted.catalog.repository;
import com.vanted.catalog.domain.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface EmployeeRepository extends JpaRepository<Employee,Long>{ List<Employee> findAllByOrderByLastNameAscFirstNameAsc(); long countByDepartmentId(Long departmentId); long countByDesignationId(Long designationId); }