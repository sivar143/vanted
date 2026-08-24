import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceOffering { id: string; name: string; description: string; price: number; category: string; }

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  list(): Observable<ServiceOffering[]> { return this.http.get<ServiceOffering[]>('/api/catalog/services'); }
}
