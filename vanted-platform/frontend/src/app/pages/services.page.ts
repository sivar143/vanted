import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CatalogService, ServiceOffering } from '../core/catalog/catalog.service';
import { finalize } from 'rxjs';

@Component({
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <main class="shell">
      <header><div><span class="eyebrow">VANTED</span><h1>Services</h1><p>Premium services, delivered simply.</p></div><a href="/login">Sign in</a></header>
      @if (loading()) { <p class="muted">Loading services…</p> }
      @if (error()) { <p class="error">{{ error() }}</p> }
      <section class="grid">
        @for (service of services(); track service.id) {
          <article class="card"><span class="tag">{{ service.category }}</span><h2>{{ service.name }}</h2><p>{{ service.description }}</p><strong>{{ service.price | currency:'INR':'symbol':'1.0-0' }}</strong></article>
        } @empty { <p class="muted">No active services found.</p> }
      </section>
    </main>
  `,
  styles: [`
    .shell{min-height:100vh;padding:48px clamp(20px,6vw,96px);background:#07111f;color:#eef5ff}header{display:flex;align-items:center;justify-content:space-between;margin-bottom:42px}header a{color:#9ec5ff}.eyebrow{font-weight:800;letter-spacing:.22em;color:#9ec5ff}h1{font-size:clamp(2.2rem,5vw,4rem);margin:.2em 0}header p,.muted{color:#a9bbce}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}.card{padding:24px;border:1px solid #20344a;border-radius:18px;background:#0d1b2a}.card p{color:#b8c8d9;line-height:1.6;min-height:76px}.card strong{font-size:1.3rem}.tag{display:inline-block;padding:5px 9px;border-radius:999px;background:#173557;color:#9ec5ff;font-size:.8rem}.error{color:#ff9b9b}
  `]
})
export class ServicesPage {
  private readonly catalog = inject(CatalogService);
  readonly services = signal<ServiceOffering[]>([]); readonly loading = signal(true); readonly error = signal('');
  constructor(){this.catalog.list().pipe(finalize(()=>this.loading.set(false))).subscribe({next:items=>this.services.set(items),error:()=>this.error.set('Unable to load services')});}
}
