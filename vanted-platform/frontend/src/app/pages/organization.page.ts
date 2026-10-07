import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { OrganizationService, Department, Designation, Employee } from '../core/organization/organization.service';

@Component({
  selector: 'vanted-organization',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="page">
      <header><div><small>ADMINISTRATION</small><h1>Organization</h1><p>Manage departments, designations and employee assignments.</p></div><button (click)="newDepartment()">+ Add Department</button></header>
      @if (error()) { <div class="error">{{ error() }}</div> }
      @if (message()) { <div class="ok">{{ message() }}</div> }

      <section>
        <h2>Departments <button (click)="newDepartment()">Add Department</button></h2>
        @if (deptEdit()) { <div class="form"><input placeholder="Department name" [(ngModel)]="deptName"><textarea placeholder="Description" [(ngModel)]="deptDesc"></textarea><button (click)="saveDepartment()">Save</button><button (click)="deptEdit.set(false)">Cancel</button></div> }
        <table><tr><th>Name</th><th>Description</th><th>Employees</th><th>Actions</th></tr>
          @for (d of departments(); track d.id) { <tr><td>{{ d.name }}</td><td>{{ d.description || '—' }}</td><td>{{ d.employeeCount }}</td><td><button (click)="editDepartment(d)">Edit</button><button class="danger" [disabled]="d.employeeCount > 0" [title]="d.employeeCount > 0 ? deptDeleteMessage : null" (click)="deleteDepartment(d)">Delete</button></td></tr> }
        </table>
        @for (d of departments(); track d.id) { @if (d.employeeCount > 0) { <p class="warn">{{ d.name }} has employees assigned. Please reassign the employees to another department before deleting this department.</p> } }
      </section>

      <section>
        <h2>Designations <button (click)="newDesignation()">+ Add Designation</button></h2>
        @if (desigEdit()) { <div class="form"><input placeholder="Designation name" [(ngModel)]="desigName"><select [(ngModel)]="desigDepartment"><option [ngValue]="0">Select department</option>@for (d of departments(); track d.id) { <option [ngValue]="d.id">{{ d.name }}</option> }</select><textarea placeholder="Description" [(ngModel)]="desigDesc"></textarea><button (click)="saveDesignation()">Save</button><button (click)="desigEdit.set(false)">Cancel</button></div> }
        <table><tr><th>Designation</th><th>Department</th><th>Description</th><th>Employees</th><th>Actions</th></tr>
          @for (g of designations(); track g.id) { <tr><td>{{ g.name }}</td><td>{{ g.departmentName }}</td><td>{{ g.description || '—' }}</td><td>{{ g.employeeCount }}</td><td><button (click)="editDesignation(g)">Edit</button><button class="danger" [disabled]="g.employeeCount > 0" [title]="g.employeeCount > 0 ? desigDeleteMessage : null" (click)="deleteDesignation(g)">Delete</button></td></tr> }
        </table>
        @for (g of designations(); track g.id) { @if (g.employeeCount > 0) { <p class="warn">{{ g.name }} has employees assigned. Please reassign the employees to another designation before deleting this designation.</p> } }
      </section>

      <section>
        <h2>Employee assignments</h2><p>Reassign employees here before deleting a department or designation.</p>
        <table><tr><th>Employee</th><th>Code</th><th>Department</th><th>Designation</th><th>Action</th></tr>
          @for (e of employees(); track e.id) { <tr><td>{{ e.firstName }} {{ e.lastName }}</td><td>{{ e.employeeCode }}</td><td><select [ngModel]="e.departmentId" (ngModelChange)="changeDepartment(e, $event)">@for (d of departments(); track d.id) { <option [ngValue]="d.id">{{ d.name }}</option> }</select></td><td><select [ngModel]="e.designationId" (ngModelChange)="e.designationId = $event">@for (g of designationsFor(e.departmentId); track g.id) { <option [ngValue]="g.id">{{ g.name }}</option> }</select></td><td><button (click)="saveEmployee(e)">Save assignment</button></td></tr> }
        </table>
      </section>
    </main>
  `,
  styles: [`
    .page{max-width:1250px;margin:auto;padding:110px 28px 60px;color:#eef5ff}header{display:flex;justify-content:space-between;align-items:center}
    small{color:#6ca8ff;letter-spacing:.15em}h1{margin:5px 0}section{margin-top:24px;padding:22px;background:#0b1724;border:1px solid #24384d;border-radius:14px}
    h2{display:flex;justify-content:space-between;align-items:center}table{width:100%;border-collapse:collapse}th,td{padding:10px;border-top:1px solid #203449;text-align:left}
    input,textarea,select{background:#08121e;color:#eef5ff;border:1px solid #30465d;border-radius:7px;padding:9px;margin:4px;width:calc(100% - 8px)}
    .form{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:15px}.form textarea{grid-column:1/-1}
    button{background:#17304a;color:#eef5ff;border:1px solid #35506a;border-radius:7px;padding:8px 12px;margin:2px;cursor:pointer}button:disabled{opacity:.45;cursor:not-allowed}
    .danger{color:#ffb7bd;border-color:#8f3944}.warn{color:#ffc98a;font-size:13px}.error{background:#2a1217;color:#ffb9bf;padding:12px;margin:15px 0;border-radius:8px}
    .ok{background:#10261d;color:#9de2bd;padding:12px;margin:15px 0;border-radius:8px}@media(max-width:800px){.form{grid-template-columns:1fr}}
  `]
})
export class OrganizationPage {
  private api = inject(OrganizationService);
  departments = signal<Department[]>([]); designations = signal<Designation[]>([]); employees = signal<Employee[]>([]);
  error = signal(''); message = signal(''); deptEdit = signal(false); desigEdit = signal(false);
  deptId = 0; deptName = ''; deptDesc = ''; desigId = 0; desigName = ''; desigDepartment = 0; desigDesc = '';
  deptDeleteMessage = 'Employees are already assigned to this department. Please reassign the employees to another department before deleting this department.';
  desigDeleteMessage = 'Employees are already assigned to this designation. Please reassign the employees to another designation before deleting this designation.';

  constructor(){ this.load(); }
  load(){ this.api.get().subscribe({next:r=>{this.departments.set(r.departments);this.designations.set(r.designations);this.employees.set(r.employees)},error:e=>this.fail(e)}); }
  newDepartment(){this.clear();this.deptId=0;this.deptName='';this.deptDesc='';this.deptEdit.set(true)}
  editDepartment(d:Department){this.clear();this.deptId=d.id;this.deptName=d.name;this.deptDesc=d.description||'';this.deptEdit.set(true)}
  saveDepartment(){if(!this.deptName.trim()){this.error.set('Department name is required.');return}const v={name:this.deptName.trim(),description:this.deptDesc};const request=this.deptId?this.api.updateDepartment(this.deptId,v):this.api.createDepartment(v);request.subscribe({next:()=>{this.message.set('Department saved.');this.deptEdit.set(false);this.load()},error:e=>this.fail(e)})}
  deleteDepartment(d:Department){if(d.employeeCount>0)return;if(!confirm('Delete '+d.name+'?'))return;this.api.deleteDepartment(d.id).subscribe({next:()=>{this.message.set('Department deleted.');this.load()},error:e=>this.fail(e)})}
  newDesignation(){this.clear();this.desigId=0;this.desigName='';this.desigDepartment=this.departments()[0]?.id||0;this.desigDesc='';this.desigEdit.set(true)}
  editDesignation(g:Designation){this.clear();this.desigId=g.id;this.desigName=g.name;this.desigDepartment=g.departmentId;this.desigDesc=g.description||'';this.desigEdit.set(true)}
  saveDesignation(){if(!this.desigName.trim()||!this.desigDepartment){this.error.set('Designation name and department are required.');return}const v={name:this.desigName.trim(),departmentId:this.desigDepartment,description:this.desigDesc};const request=this.desigId?this.api.updateDesignation(this.desigId,v):this.api.createDesignation(v);request.subscribe({next:()=>{this.message.set('Designation saved.');this.desigEdit.set(false);this.load()},error:e=>this.fail(e)})}
  deleteDesignation(g:Designation){if(g.employeeCount>0)return;if(!confirm('Delete '+g.name+'?'))return;this.api.deleteDesignation(g.id).subscribe({next:()=>{this.message.set('Designation deleted.');this.load()},error:e=>this.fail(e)})}
  designationsFor(id:number){return this.designations().filter(g=>g.departmentId===Number(id))}
  changeDepartment(e:Employee,id:number){e.departmentId=Number(id);const gs=this.designationsFor(e.departmentId);if(!gs.some(g=>g.id===e.designationId))e.designationId=gs[0]?.id||0;this.employees.set([...this.employees()])}
  saveEmployee(e:Employee){const g=this.designations().find(x=>x.id===e.designationId);if(!g||g.departmentId!==e.departmentId){this.error.set('The selected designation must belong to the selected department.');return}this.api.updateEmployee(e.id,{firstName:e.firstName,lastName:e.lastName,email:e.email,departmentId:e.departmentId,designationId:e.designationId}).subscribe({next:()=>{this.message.set('Employee assignment updated.');this.load()},error:x=>this.fail(x)})}
  private clear(){this.error.set('');this.message.set('')}
  private fail(e:unknown){const x=e as HttpErrorResponse;this.message.set('');this.error.set(x.error?.message||x.message||'The operation could not be completed.')}
}
