import {Injectable,inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
export interface Department{id:number;name:string;description:string|null;employeeCount:number}
export interface Designation{id:number;name:string;departmentId:number;departmentName:string;description:string|null;employeeCount:number}
export interface Employee{id:number;employeeCode:string;firstName:string;lastName:string;email:string|null;departmentId:number;designationId:number}
export interface OrganizationResponse{departments:Department[];designations:Designation[];employees:Employee[]}
@Injectable({providedIn:'root'}) export class OrganizationService{
 private http=inject(HttpClient);
 get(){return this.http.get<OrganizationResponse>('/api/catalog/organization')}
 createDepartment(v:{name:string;description:string}){return this.http.post<Department>('/api/catalog/organization/departments',v)}
 updateDepartment(id:number,v:{name:string;description:string}){return this.http.put<Department>('/api/catalog/organization/departments/'+id,v)}
 deleteDepartment(id:number){return this.http.delete<void>('/api/catalog/organization/departments/'+id)}
 createDesignation(v:{name:string;departmentId:number;description:string}){return this.http.post<Designation>('/api/catalog/organization/designations',v)}
 updateDesignation(id:number,v:{name:string;departmentId:number;description:string}){return this.http.put<Designation>('/api/catalog/organization/designations/'+id,v)}
 deleteDesignation(id:number){return this.http.delete<void>('/api/catalog/organization/designations/'+id)}
 updateEmployee(id:number,v:Partial<Employee>){return this.http.put<Employee>('/api/catalog/organization/employees/'+id,v)}
}