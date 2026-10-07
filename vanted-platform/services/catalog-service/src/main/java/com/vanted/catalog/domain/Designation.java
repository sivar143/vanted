package com.vanted.catalog.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="designations", uniqueConstraints=@UniqueConstraint(name="uk_designations_department_name", columnNames={"department_id","name"}))
public class Designation {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,length=150) private String name;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="department_id",nullable=false) private Department department;
    @Column(length=500) private String description;
    @Column(nullable=false) private boolean active=true;
    @Column(name="created_at",nullable=false) private Instant createdAt;
    @Column(name="updated_at",nullable=false) private Instant updatedAt;
    protected Designation(){}
    public Designation(String name,Department department,String description){this.name=name;this.department=department;this.description=description;this.createdAt=Instant.now();this.updatedAt=this.createdAt;}
    @PreUpdate void touch(){updatedAt=Instant.now();}
    public Long getId(){return id;} public String getName(){return name;} public Department getDepartment(){return department;} public String getDescription(){return description;} public boolean isActive(){return active;}
    public void update(String name,Department department,String description){this.name=name;this.department=department;this.description=description;}
}