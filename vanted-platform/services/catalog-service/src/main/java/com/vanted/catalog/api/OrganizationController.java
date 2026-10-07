package com.vanted.catalog.api;

import com.vanted.catalog.domain.*;
import com.vanted.catalog.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/catalog/organization")
@PreAuthorize("hasAnyRole('ADMIN','HR')")
public class OrganizationController {
 private final DepartmentRepository departments; private final DesignationRepository designations; private final EmployeeRepository employees;
 public OrganizationController(DepartmentRepository d,DesignationRepository g,EmployeeRepository e){departments=d;designations=g;employees=e;}

 @GetMapping public OrganizationResponse get(){return new OrganizationResponse(departments.findAll(),designations.findAllByOrderByNameAsc(),employees.findAllByOrderByLastNameAscFirstNameAsc());}

 @PostMapping("/departments") public DepartmentResponse createDepartment(@Valid @RequestBody DepartmentRequest r){if(departments.existsByNameIgnoreCase(r.name())) throw conflict("Department name already exists"); return DepartmentResponse.from(departments.save(new Department(r.name().trim(),r.description())));}
 @PutMapping("/departments/{id}") public DepartmentResponse updateDepartment(@PathVariable Long id,@Valid @RequestBody DepartmentRequest r){Department d=department(id);if(!d.getName().equalsIgnoreCase(r.name().trim())&&departments.existsByNameIgnoreCase(r.name()))throw conflict("Department name already exists");d.update(r.name().trim(),r.description());return DepartmentResponse.from(departments.save(d));}
 @DeleteMapping("/departments/{id}") public ResponseEntity<Void> deleteDepartment(@PathVariable Long id){department(id);long n=employees.countByDepartmentId(id);if(n>0) throw new EmployeeAssignmentException("Employees are already assigned to this department. Please reassign the employees to another department before deleting this department.");departments.deleteById(id);return ResponseEntity.noContent().build();}

 @PostMapping("/designations") public DesignationResponse createDesignation(@Valid @RequestBody DesignationRequest r){Department d=department(r.departmentId());if(designations.existsByDepartmentIdAndNameIgnoreCase(d.getId(),r.name()))throw conflict("Designation name already exists in this department");return DesignationResponse.from(designations.save(new Designation(r.name().trim(),d,r.description())));}
 @PutMapping("/designations/{id}") public DesignationResponse updateDesignation(@PathVariable Long id,@Valid @RequestBody DesignationRequest r){Designation g=designation(id);Department d=department(r.departmentId());if((!g.getName().equalsIgnoreCase(r.name().trim())||!g.getDepartment().getId().equals(d.getId()))&&designations.existsByDepartmentIdAndNameIgnoreCase(d.getId(),r.name()))throw conflict("Designation name already exists in this department");g.update(r.name().trim(),d,r.description());return DesignationResponse.from(designations.save(g));}
 @DeleteMapping("/designations/{id}") public ResponseEntity<Void> deleteDesignation(@PathVariable Long id){designation(id);long n=employees.countByDesignationId(id);if(n>0)throw new EmployeeAssignmentException("Employees are already assigned to this designation. Please reassign the employees to another designation before deleting this designation.");designations.deleteById(id);return ResponseEntity.noContent().build();}

 @PutMapping("/employees/{id}") public EmployeeResponse updateEmployee(@PathVariable Long id,@Valid @RequestBody EmployeeRequest r){Employee e=employees.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Employee not found"));Department d=department(r.departmentId());Designation g=designation(r.designationId());if(!g.getDepartment().getId().equals(d.getId()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"The selected designation does not belong to the selected department.");e.update(r.firstName().trim(),r.lastName().trim(),r.email(),d,g);return EmployeeResponse.from(employees.save(e));}
 @PostMapping("/employees") public EmployeeResponse createEmployee(@Valid @RequestBody CreateEmployeeRequest r){Department d=department(r.departmentId());Designation g=designation(r.designationId());if(!g.getDepartment().getId().equals(d.getId()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"The selected designation does not belong to the selected department.");return EmployeeResponse.from(employees.save(new Employee(r.employeeCode().trim(),r.firstName().trim(),r.lastName().trim(),r.email(),d,g)));}

 private Department department(Long id){return departments.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Department not found"));}
 private Designation designation(Long id){return designations.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Designation not found"));}
 private ResponseStatusException conflict(String m){return new ResponseStatusException(HttpStatus.CONFLICT,m);}
 public record DepartmentRequest(@NotBlank String name,String description){}
 public record DesignationRequest(@NotBlank String name,Long departmentId,String description){}
 public record CreateEmployeeRequest(@NotBlank String employeeCode,@NotBlank String firstName,@NotBlank String lastName,String email,Long departmentId,Long designationId){}
 public record EmployeeRequest(@NotBlank String firstName,@NotBlank String lastName,String email,Long departmentId,Long designationId){}
 public record OrganizationResponse(List<Department> departments,List<Designation> designations,List<Employee> employees){}
 public record DepartmentResponse(Long id,String name,String description,long employeeCount){static DepartmentResponse from(Department d){return new DepartmentResponse(d.getId(),d.getName(),d.getDescription(),0);}}
 public record DesignationResponse(Long id,String name,Long departmentId,String departmentName,String description,long employeeCount){static DesignationResponse from(Designation d){return new DesignationResponse(d.getId(),d.getName(),d.getDepartment().getId(),d.getDepartment().getName(),d.getDescription(),0);}}
 public record EmployeeResponse(Long id,String employeeCode,String firstName,String lastName,String email,Long departmentId,Long designationId){static EmployeeResponse from(Employee e){return new EmployeeResponse(e.getId(),e.getEmployeeCode(),e.getFirstName(),e.getLastName(),e.getEmail(),e.getDepartment().getId(),e.getDesignation().getId());}}
 @ResponseStatus(HttpStatus.CONFLICT) static class EmployeeAssignmentException extends RuntimeException{EmployeeAssignmentException(String m){super(m);}}
}