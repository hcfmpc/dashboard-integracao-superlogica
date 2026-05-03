import { Component, inject, signal } from '@angular/core';
import { PollingService } from './services/polling.service';
import { DashboardTableComponent } from './components/dashboard-table/dashboard-table.component';
import { HistoricoPanelComponent } from './components/historico-panel/historico-panel.component';
import { ErrorBannerComponent } from './components/error-banner/error-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardTableComponent, HistoricoPanelComponent, ErrorBannerComponent],
  template: `
    <main class="container">
      <app-error-banner />
      <app-dashboard-table
        [statusList]="polling.status()"
        (condominioSelecionado)="condominioSelecionadoId.set($event)"
      />
      <app-historico-panel [condominioId]="condominioSelecionadoId()" />
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
