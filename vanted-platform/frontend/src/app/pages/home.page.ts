import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="hero">
      <p class="eyebrow">VANTED</p>
      <h1>Discover services built around you.</h1>
      <p class="lead">A modern service marketplace. The new Angular platform is now the foundation for Vanted.</p>
      <a routerLink="/services" class="button">Explore services</a>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {}
