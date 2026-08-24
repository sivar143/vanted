import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <main class="page">
      <h1>Services</h1>
      <p>The service catalogue will be connected to the Spring Boot API in the next implementation phase.</p>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesPage {}
