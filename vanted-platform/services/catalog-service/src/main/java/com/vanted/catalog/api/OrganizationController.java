package com.vanted.catalog.api;

import com.vanted.catalog.domain.*;
import com.vanted.catalog.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/catalog/organization")
@PreAuthorize("hasAnyRole('ADMIN','HR')")
public class OrganizationController {
    private final DepartmentRepository departments;
    private final DesignationRepository designations;
    private final EmployeeRepository employees;

    public OrganizationController(DepartmentRepository departments, DesignationRepository designations, EmployeeRepository employees) {
        this.departments = departments; this.designations = designations; this.employees = employees;
    }

    @GetMapping
    public OrganizationResponse get() {
        return new OrganizationResponse(
            departments.findAll().stream().map(d -> DepartmentResponse.from(d, employees.countByDepartmentId(d.getId()))).toList(),
            designations.findAllByOrderByNameAsc().stream().map(d -> DesignationResponse.from(d, employees.countByDesignationId(d.getId()))).toList(),
            employees.findAllByOrderByLastNameAscFirstNameAsc().stream().map(EmployeeResponse::from).toList()
        );
    }

    @PostMapping("/departments")
    public DepartmentResponse createDepartment(@Valid @RequestBody DepartmentRequest r) {
        String name=r.name().trim();
        if (departments.existsByNameIgnoreCase(name)) throw conflict("Department name already exists");
        Department d=departments.save(new Department(name,r.description()));
        return DepartmentResponse.from(d,0);
    }

    @PutMapping("/departments/{id}")
    public DepartmentResponse updateDepartment(@PathVariable Long id,@Valid @RequestBody DepartmentRequest r) {
        Department d=department(id); String name=r.name().trim();
        if(!d.getName().equalsIgnoreCase(name)&&departments.existsByNameIgnoreCase(name)) throw conflict("Department name already exists");
        d.update(name,r.description());
        return DepartmentResponse.from(departments.save(d),employees.countByDepartmentId(id));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        department(id);
        long count=employees.countByDepartmentId(id);
        if(count>0) throw new EmployeeAssignmentException("Employees are already assigned to this department. Please reassign the employees to another department before deleting this department.");
        if(designations.countByDepartmentId(id)>0) throw conflict("Designations still exist in this department. Delete or move the designations before deleting the department.");
        departments.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/designations")
    public DesignationResponse createDesignation(@Valid @RequestBody DesignationRequest r) {
        Department d=department(r.departmentId()); String name=r.name().trim();
        if(designations.existsByDepartmentIdAndNameIgnoreCase(d.getId(),name)) throw conflict("Designation name already exists in this department");
        Designation g=designations.save(new Designation(name,d,r.description()));
        return DesignationResponse.from(g,0);
    }

    @PutMapping("/designations/{id}")
    public DesignationResponse updateDesignation(@PathVariable Long id,@Valid @RequestBody DesignationRequest r) {
        Designation g=designation(id); Department d=department(r.departmentId()); String name=r.name().trim();
        if((!g.getName().equalsIgnoreCase(name)||!g.getDepartment().getId().equals(d.getId()))&&designations.existsByDepartmentIdAndNameIgnoreCase(d.getId(),name))
            throw conflict("Designation name already exists in this department");
        g.update(name,d,r.description());
        return DesignationResponse.from(designations.save(g),employees.countByDesignationId(id));
    }

    @DeleteMapping("/designations/{id}")
    public ResponseEntity<Void> deleteDesignation(@PathVariable Long id) {
        designation(id);
        long count=employees.countByDesignationId(id);
        if(count>0) throw new EmployeeAssignmentException("Employees are already assigned to this designation. Please reassign the employees to another designation before deleting this designation.");
        designations.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/employees")
    public EmployeeResponse createEmployee(@Valid @RequestBody CreateEmployeeRequest r) {
        Department d=department(r.departmentId()); Designation g=designation(r.designationId()); validateAssignment(d,g);
        return EmployeeResponse.from(employees.save(new Employee(r.employeeCode().trim(),r.firstName().trim(),r.lastName().trim(),r.email(),d,g)));
    }

    @PutMapping("/employees/{id}")
    public EmployeeResponse updateEmployee(@PathVariable Long id,@Valid @RequestBody EmployeeRequest r) {
        Employee e=employees.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Employee not found"));
        Department d=department(r.departmentId()); Designation g=designation(r.designationId()); validateAssignment(d,g);
        e.update(r.firstName().trim(),r.lastName().trim(),r.email(),d,g);
        return EmployeeResponse.from(employees.save(e));
    }

    private void validateAssignment(Department d,Designation g) {
        if(!g.getDepartment().getId().equals(d.getId())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"The selected designation does not belong to the selected department.");
    }
    private Department department(Long id){return departments.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Department not found"));}
    private Designation designation(Long id){return designations.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Designation not found"));}
    private ResponseStatusException conflict(String message){return new ResponseStatusException(HttpStatus.CONFLICT,message);}

    public record DepartmentRequest(@NotBlank String name,String description){}
    public record DesignationRequest(@NotBlank String name,@NotNull Long departmentId,String description){}
    public record CreateEmployeeRequest(@NotBlank String employeeCode,@NotBlank String firstName,@NotBlank String lastName,String email,@NotNull Long departmentId,@NotNull Long designationId){}
    public record EmployeeRequest(@NotBlank String firstName,@NotBlank String lastName,String email,@NotNull Long departmentId,@NotNull Long designationId){}
    public record OrganizationResponse(List<DepartmentResponse> departments,List<DesignationResponse> designations,List<EmployeeResponse> employees){}
    public record DepartmentResponse(Long id,String name,String description,long employeeCount){
        static DepartmentResponse from(Department d,long count){return new DepartmentResponse(d.getId(),d.getName(),d.getDescription(),count);}
    }
    public record DesignationResponse(Long id,String name,Long departmentId,String departmentName,String description,long employeeCount){
        static DesignationResponse from(Designation d,long count){return new DesignationResponse(d.getId(),d.getName(),d.getDepartment().getId(),d.getDepartment().getName(),d.getDescription(),count);}
    }
    public record EmployeeResponse(Long id,String employeeCode,String firstName,String lastName,String email,Long departmentId,Long designationId){
        static EmployeeResponse from(Employee e){return new EmployeeResponse(e.getId(),e.getEmployeeCode(),e.getFirstName(),e.getLastName(),e.getEmail(),e.getDepartment().getId(),e.getDesignation().getId());}
    }
    @ResponseStatus(HttpStatus.CONFLICT)
    static class EmployeeAssignmentException extends RuntimeException { EmployeeAssignmentException(String message){super(message);} }
}