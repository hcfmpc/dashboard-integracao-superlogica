import { Component, inject, signal } from '@angular/core';
import { PollingService } from './services/polling.service';
import { DashboardTableComponent } from './components/dashboard-table/dashboard-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardTableComponent],
  template: `
    <main class="container">
      <app-dashboard-table
        [statusList]="polling.status()"
        (condominioSelecionado)="condominioSelecionadoId.set($event)"
      />
    </main>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 24px auto; padding: 0 16px; }
  `]
})
export class App {
  readonly polling = inject(PollingService);
  readonly condominioSelecionadoId = signal<number | null>(null);
}
