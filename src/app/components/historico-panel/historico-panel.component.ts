import { Component, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { ExecucaoHistorico } from '../../models/execucao-status.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { StatusApiService } from '../../services/status-api.service';

@Component({
  selector: 'app-historico-panel',
  standalone: true,
  imports: [MatTableModule, MatProgressSpinnerModule, MatExpansionModule, StatusBadgeComponent, DatePipe],
  template: `
    @if (condominioId()) {
      <mat-expansion-panel expanded>
        <mat-expansion-panel-header>
          <mat-panel-title>Histórico de Execuções</mat-panel-title>
        </mat-expansion-panel-header>

        @if (loading()) {
          <div class="loading-wrapper">
            <mat-spinner diameter="32" />
          </div>
        } @else {
          <mat-table [dataSource]="historico()" class="mat-elevation-z1">
            <ng-container matColumnDef="executadoEm">
              <mat-header-cell *matHeaderCellDef>Executado em</mat-header-cell>
              <mat-cell *matCellDef="let row">{{ row.executadoEm | date:'dd/MM/yyyy HH:mm' }}</mat-cell>
            </ng-container>

            <ng-container matColumnDef="periodo">
              <mat-header-cell *matHeaderCellDef>Período</mat-header-cell>
              <mat-cell *matCellDef="let row">
                {{ row.dataInicial | date:'dd/MM' }} – {{ row.dataFinal | date:'dd/MM/yyyy' }}
              </mat-cell>
            </ng-container>

            <ng-container matColumnDef="status">
              <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
              <mat-cell *matCellDef="let row"><app-status-badge [status]="row.status" /></mat-cell>
            </ng-container>

            <ng-container matColumnDef="totalRegistros">
              <mat-header-cell *matHeaderCellDef>Títulos</mat-header-cell>
              <mat-cell *matCellDef="let row">{{ row.totalRegistros }}</mat-cell>
            </ng-container>

            <ng-container matColumnDef="mensagemErro">
              <mat-header-cell *matHeaderCellDef>Erro</mat-header-cell>
              <mat-cell *matCellDef="let row">{{ row.mensagemErro ?? '—' }}</mat-cell>
            </ng-container>

            <mat-header-row *matHeaderRowDef="columns" />
            <mat-row *matRowDef="let row; columns: columns;" />

            @if (historico().length === 0) {
              <div *matNoDataRow class="no-data">Nenhum histórico encontrado.</div>
            }
          </mat-table>
        }
      </mat-expansion-panel>
    }
  `,
  styles: [`
    .loading-wrapper { display: flex; justify-content: center; padding: 24px; }
    mat-table { width: 100%; margin-top: 8px; }
    .no-data { padding: 16px; text-align: center; color: #666; }
  `]
})
export class HistoricoPanelComponent {
  private api = inject(StatusApiService);

  readonly condominioId = input<number | null>(null);
  readonly historico = signal<ExecucaoHistorico[]>([]);
  readonly loading = signal(false);

  constructor() {
    effect(() => {
      const id = this.condominioId();
      if (id === null) {
        this.historico.set([]);
        return;
      }
      this.loading.set(true);
      this.api.getHistorico(id).subscribe({
        next: data => { this.historico.set(data); this.loading.set(false); },
        error: () => { this.historico.set([]); this.loading.set(false); }
      });
    });
  }

  readonly columns = ['executadoEm', 'periodo', 'status', 'totalRegistros', 'mensagemErro'];
}
