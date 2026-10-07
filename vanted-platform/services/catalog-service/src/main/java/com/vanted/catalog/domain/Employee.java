package com.vanted.catalog.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="employees")
public class Employee {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="employee_code",nullable=false,unique=true,length=50) private String employeeCode;
    @Column(name="first_name",nullable=false,length=100) private String firstName;
    @Column(name="last_name",nullable=false,length=100) private String lastName;
    @Column(length=320) private String email;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="department_id",nullable=false) private Department department;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="designation_id",nullable=false) private Designation designation;
    @Column(nullable=false) private boolean active=true;
    @Column(name="created_at",nullable=false) private Instant createdAt;
    @Column(name="updated_at",nullable=false) private Instant updatedAt;
    protected Employee(){}
    public Employee(String code,String first,String last,String email,Department department,Designation designation){this.employeeCode=code;this.firstName=first;this.lastName=last;this.email=email;this.department=department;this.designation=designation;this.createdAt=Instant.now();this.updatedAt=this.createdAt;}
    @PreUpdate void touch(){updatedAt=Instant.now();}
    public Long getId(){return id;} public String getEmployeeCode(){return employeeCode;} public String getFirstName(){return firstName;} public String getLastName(){return lastName;} public String getEmail(){return email;} public Department getDepartment(){return department;} public Designation getDesignation(){return designation;} public boolean isActive(){return active;}
    public void update(String first,String last,String email,Department department,Designation designation){this.firstName=first;this.lastName=last;this.email=email;this.department=department;this.designation=designation;}
}