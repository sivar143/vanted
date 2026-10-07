import {computed,inject,Injectable,signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable,shareReplay,tap} from 'rxjs';
import {AuthResponse,User} from './auth.models';
@Injectable({providedIn:'root'}) export class AuthService{
 private http=inject(HttpClient); private key='vanted.accessToken'; private userSignal=signal<User|null>(null);
 readonly user=this.userSignal.asReadonly(); readonly authenticated=computed(()=>!!this.userSignal());
 readonly canManageOrganization=computed(()=>{const r=this.userSignal()?.role;return r==='ADMIN'||r==='HR'});
 constructor(){const t=sessionStorage.getItem(this.key);if(t)this.loadMe().subscribe({error:()=>this.clearSession()})}
 login(email:string,password:string):Observable<AuthResponse>{return this.http.post<AuthResponse>('/api/auth/login',{email,password},{withCredentials:true}).pipe(tap(r=>this.accept(r)))}
 register(email:string,password:string,firstName:string,lastName:string):Observable<AuthResponse>{return this.http.post<AuthResponse>('/api/auth/register',{email,password,firstName,lastName},{withCredentials:true}).pipe(tap(r=>this.accept(r)))}
 refresh():Observable<AuthResponse>{return this.http.post<AuthResponse>('/api/auth/refresh',{}, {withCredentials:true}).pipe(tap(r=>this.accept(r)),shareReplay(1))}
 logout(){return this.http.post<void>('/api/auth/logout',{}, {withCredentials:true}).pipe(tap(()=>this.clearSession()))}
 loadMe(){return this.http.get<User>('/api/auth/me',{withCredentials:true}).pipe(tap(u=>this.userSignal.set(u)))}
 accessToken(){return sessionStorage.getItem(this.key)} clearSession(){sessionStorage.removeItem(this.key);this.userSignal.set(null)}
 private accept(r:AuthResponse){sessionStorage.setItem(this.key,r.accessToken);this.userSignal.set(r.user)}
}