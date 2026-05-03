# Dashboard Integração Superlógica – Especificação do Frontend

> **Repositório**: `dashboard-integracao-superlogica`
> **Parte de**: [Sistema Global](../../sdd/01-spec.md)
> **Consome**: API em `api-integracao-superlogica` (porta :5000)

## 1. Missão

Fornecer ao gestor de condomínios um painel web em tempo real para acompanhar cada etapa do ciclo de integração CNAB 240 × Superlógica — sem precisar acessar logs técnicos, arquivos ou o servidor diretamente.

## 2. Persona

**Administrador de condomínios**: gestor não-técnico que precisa saber, a qualquer momento, se os boletos liquidados de cada condomínio já foram enviados ao Superlógica ou se há algum problema que exige atenção.

## 3. Histórias de Usuário

- **HU7**: Como administrador, quero ver em uma tabela o status atual de cada condomínio, com badges coloridos indicando a fase atual do ciclo (A PROCESSAR → … → FINALIZADO BAIXA DE TÍTULOS), para saber exatamente onde está cada integração sem consultar logs técnicos.
- **HU8**: Como administrador, quero ver o horário da próxima execução programada e o histórico das últimas execuções de cada condomínio (data, status, quantidade de títulos), para acompanhamento e conferência.
- **HU9**: Como administrador, quero que o painel atualize automaticamente sem precisar recarregar a página, para ter visibilidade contínua durante o processamento matinal.
- **HU10**: Como administrador, quero identificar visualmente falhas de forma imediata (badge vermelho), com mensagem de erro legível, para agir rapidamente sem interpretar logs técnicos.

## 4. Regras de Exibição

- O painel atualiza o status de todos os condomínios a cada 15 s consumindo `GET /api/status`.
- O histórico de um condomínio é carregado sob demanda ao clicar no seu nome (lazy load via `GET /api/execucoes/{id}`).
- Badges de status devem refletir fielmente o enum `ExecucaoStatus` (9 estados) definido no contrato global.
- Falhas (`FALHA_TEMPORARIA`, `FALHA_PERMANENTE`) exibem badge vermelho e mensagem de erro legível; `FALHA_PERMANENTE` exibe ícone de alerta adicional.
- `NÃO HÁ TÍTULOS BAIXADOS` (`SEM_TITULOS`) não é uma falha — badge verde claro.
- O painel não exibe CPF, nome de condômino, valor de boleto ou nosso-número.

## 5. Estados de Exibição (contrato com a API)

| Enum `ExecucaoStatus` | Label exibida | Cor do badge |
|---|---|---|
| `A_PROCESSAR` | A PROCESSAR | cinza `#9e9e9e` |
| `PROCESSAMENTO_FINALIZADO` | PROCESSAMENTO FINALIZADO | azul claro `#42a5f5` |
| `ARQUIVO_BAIXADO` | ARQUIVO BAIXADO | azul `#1976d2` |
| `ENVIANDO_TITULOS` | ENVIANDO TÍTULOS BAIXADOS | laranja `#fb8c00` |
| `SEM_TITULOS` | NÃO HÁ TÍTULOS BAIXADOS | verde claro `#66bb6a` |
| `ENVIADO_SUPERLOGICA` | ENVIADO À SUPERLÓGICA | verde `#43a047` |
| `FINALIZADO` | FINALIZADO BAIXA DE TÍTULOS | verde escuro `#2e7d32` |
| `FALHA_TEMPORARIA` | FALHA (reprocessando…) | vermelho `#e53935` |
| `FALHA_PERMANENTE` | FALHA PERMANENTE ⚠ | vermelho escuro `#b71c1c` |

> Contrato canônico em [sdd global §02-plan](../../sdd/02-plan.md#modelo-de-status).

## 6. Cenários de Exibição de Falha

- **API .NET indisponível**: exibir banner "Não foi possível conectar ao servidor. Tentando novamente…" e manter último estado conhecido.
- **Condomínio em `FALHA_PERMANENTE`**: badge vermelho escuro + ícone de alerta + `mensagemErro` expandível.
- **Polling sem resposta por > 60 s**: indicador "Aguardando resposta…" na linha do condomínio.
