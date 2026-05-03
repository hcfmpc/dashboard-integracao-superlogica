import { Pipe, PipeTransform } from '@angular/core';
import { ExecucaoStatus } from '../models/execucao-status.model';

const STATUS_LABELS: Record<ExecucaoStatus, string> = {
  A_PROCESSAR: 'A Processar',
  PROCESSAMENTO_FINALIZADO: 'Processamento Finalizado',
  ARQUIVO_BAIXADO: 'Arquivo Baixado',
  ENVIANDO_TITULOS: 'Enviando Títulos',
  SEM_TITULOS: 'Sem Títulos',
  ENVIADO_SUPERLOGICA: 'Enviado Superlógica',
  FINALIZADO: 'Finalizado',
  FALHA_TEMPORARIA: 'Falha Temporária',
  FALHA_PERMANENTE: 'Falha Permanente'
};

@Pipe({ name: 'execucaoStatus', standalone: true })
export class ExecucaoStatusPipe implements PipeTransform {
  transform(value: ExecucaoStatus): string {
    return STATUS_LABELS[value] ?? value;
  }
}
