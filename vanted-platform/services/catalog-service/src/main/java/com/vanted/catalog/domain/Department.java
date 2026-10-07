package com.vanted.catalog.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "departments")
public class Department {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false, unique=true, length=150) private String name;
    @Column(length=500) private String description;
    @Column(nullable=false) private boolean active = true;
    @Column(name="created_at", nullable=false) private Instant createdAt;
    @Column(name="updated_at", nullable=false) private Instant updatedAt;

    protected Department() {}
    public Department(String name, String description) { this.name=name; this.description=description; this.createdAt=Instant.now(); this.updatedAt=this.createdAt; }
    @PreUpdate void touch(){updatedAt=Instant.now();}
    public Long getId(){return id;} public String getName(){return name;} public String getDescription(){return description;} public boolean isActive(){return active;}
    public void update(String name,String description){this.name=name;this.description=description;}
}