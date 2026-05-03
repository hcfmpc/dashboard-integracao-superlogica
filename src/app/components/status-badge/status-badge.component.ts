import { Component, computed, input } from '@angular/core';
import { ExecucaoStatus } from '../../models/execucao-status.model';
import { ExecucaoStatusPipe } from '../../pipes/execucao-status.pipe';

const STATUS_CLASS: Record<ExecucaoStatus, string> = {
  A_PROCESSAR:               'status-a-processar',
  PROCESSAMENTO_FINALIZADO:  'status-processamento-finalizado',
  ARQUIVO_BAIXADO:           'status-arquivo-baixado',
  ENVIANDO_TITULOS:          'status-enviando-titulos',
  SEM_TITULOS:               'status-sem-titulos',
  ENVIADO_SUPERLOGICA:       'status-enviado-superlogica',
  FINALIZADO:                'status-finalizado',
  FALHA_TEMPORARIA:          'status-falha-temporaria',
  FALHA_PERMANENTE:          'status-falha-permanente'
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [ExecucaoStatusPipe],
  template: `
    <span class="badge" [class]="cssClass()" [attr.data-status]="status()">
      {{ status() | execucaoStatus }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 500;
      white-space: nowrap;
    }
    .status-a-processar               { color: #5c5c5c; background: #e0e0e0; }
    .status-processamento-finalizado  { color: #1565c0; background: #bbdefb; }
    .status-arquivo-baixado           { color: #0277bd; background: #b3e5fc; }
    .status-enviando-titulos          { color: #e65100; background: #ffe0b2; }
    .status-sem-titulos               { color: #4e342e; background: #d7ccc8; }
    .status-enviado-superlogica       { color: #1b5e20; background: #c8e6c9; }
    .status-finalizado                { color: #2e7d32; background: #a5d6a7; }
    .status-falha-temporaria          { color: #e65100; background: #ffccbc; }
    .status-falha-permanente          { color: #b71c1c; background: #ffcdd2; }
  `]
})
export class StatusBadgeComponent {
  readonly status = input.required<ExecucaoStatus>();
  readonly cssClass = computed(() => STATUS_CLASS[this.status()] ?? '');
}
