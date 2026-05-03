export type ExecucaoStatus =
  | 'A_PROCESSAR'
  | 'PROCESSAMENTO_FINALIZADO'
  | 'ARQUIVO_BAIXADO'
  | 'ENVIANDO_TITULOS'
  | 'SEM_TITULOS'
  | 'ENVIADO_SUPERLOGICA'
  | 'FINALIZADO'
  | 'FALHA_TEMPORARIA'
  | 'FALHA_PERMANENTE';

export interface StatusCondominio {
  condominioId: number;
  nome: string;
  status: ExecucaoStatus;
  statusLabel: string;
  ultimaExecucao: string;
  totalTitulos: number;
  proximaExecucao: string;
}

export interface ExecucaoHistorico {
  id: number;
  dataInicial: string;
  dataFinal: string;
  status: ExecucaoStatus;
  totalRegistros: number;
  mensagemErro: string | null;
  executadoEm: string;
}

export interface Condominio {
  id: number;
  nome: string;
  ativo: boolean;
  proximaExecucao: string;
}
