import { Component, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { StatusCondominio } from '../../models/execucao-status.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { PollingService } from '../../services/polling.service';

@Component({
  selector: 'app-dashboard-table',
  standalone: true,
  imports: [MatTableModule, StatusBadgeComponent, DatePipe],
  template: `
    <div class="table-header">
      <h2>Status da Integração</h2>
      @if (polling.lastUpdate()) {
        <span class="last-update">Última atualização: {{ polling.lastUpdate() | date:'HH:mm:ss' }}</span>
      }
    </div>

    <mat-table [dataSource]="statusList()" class="mat-elevation-z2">
      <ng-container matColumnDef="nome">
        <mat-header-cell *matHeaderCellDef>Condomínio</mat-header-cell>
        <mat-cell *matCellDef="let row">
          <button class="link-btn" (click)="condominioSelecionado.emit(row.condominioId)">
            {{ row.nome }}
          </button>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="status">
        <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
        <mat-cell *matCellDef="let row">
          <app-status-badge [status]="row.status" />
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="ultimaExecucao">
        <mat-header-cell *matHeaderCellDef>Última Execução</mat-header-cell>
        <mat-cell *matCellDef="let row">{{ row.ultimaExecucao | date:'dd/MM/yyyy HH:mm' }}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="totalTitulos">
        <mat-header-cell *matHeaderCellDef>Títulos</mat-header-cell>
        <mat-cell *matCellDef="let row">{{ row.totalTitulos }}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="proximaExecucao">
        <mat-header-cell *matHeaderCellDef>Próxima Execução</mat-header-cell>
        <mat-cell *matCellDef="let row">{{ row.proximaExecucao | date:'dd/MM/yyyy HH:mm' }}</mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="columns" />
      <mat-row *matRowDef="let row; columns: columns;" />

      @if (statusList().length === 0) {
        <div *matNoDataRow class="no-data">Nenhum condomínio encontrado.</div>
      }
    </mat-table>
  `,
  styles: [`
    .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .last-update { font-size: 0.8rem; color: #666; }
    .link-btn { background: none; border: none; color: #1565c0; cursor: pointer; font-size: inherit; padding: 0; text-decoration: underline; }
    mat-table { width: 100%; }
    .no-data { padding: 16px; text-align: center; color: #666; }
  `]
})
export class DashboardTableComponent {
  readonly polling = inject(PollingService);
  readonly statusList = input<StatusCondominio[]>([]);
  readonly condominioSelecionado = output<number>();
  readonly columns = ['nome', 'status', 'ultimaExecucao', 'totalTitulos', 'proximaExecucao'];
}
