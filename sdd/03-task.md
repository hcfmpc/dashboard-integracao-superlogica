# Dashboard Integração Superlógica – Backlog de Implementação

> **Repositório**: `dashboard-integracao-superlogica`
> **Pré-requisito**: API .NET rodando em `localhost:5000` com endpoints `/api/status`, `/api/condominios`, `/api/execucoes/{id}`

## Fase 6.1 – Setup e Polling ✅ concluída em 2026-05-03

### Setup do projeto
- [x] `ng new dashboard-integracao-superlogica --standalone --routing --style=scss`
- [x] `ng add @angular/material` (tema `azure-blue` / Material Design 3 — `indigo-pink` descontinuado no M3)
- [x] Criar `proxy.conf.json` apontando `/api` → `http://localhost:5000`
- [x] Configurar Vitest — Angular CLI v21 já usa `@angular/build:unit-test` com Vitest nativo; `vitest.config.ts` separado não necessário
- [x] Criar `environments/environment.ts` (`apiBase: ''`) e `environment.prod.ts` (`apiBase: 'http://servidor:5000'`)
- [x] Criar modelos TypeScript em `models/execucao-status.model.ts`:
  - `ExecucaoStatus` (union type com os 9 estados)
  - `StatusCondominio`, `ExecucaoHistorico`, `Condominio`

### StatusApiService
- [x] Implementar `StatusApiService` com `inject(HttpClient)`:
  - `getStatus(): Observable<StatusCondominio[]>`
  - `getCondominios(): Observable<Condominio[]>`
  - `getHistorico(id: number): Observable<ExecucaoHistorico[]>`
- [x] Testes Vitest com `provideHttpClientTesting`: 200 OK, erro de rede

### PollingService
- [x] Implementar `PollingService` com:
  - `status = signal<StatusCondominio[]>([])`
  - `apiError = signal<string | null>(null)`
  - `lastUpdate = signal<Date | null>(null)`
  - `condominiosComFalha = computed(...)`: filtra falhas
  - `totalFinalizados = computed(...)`: conta finalizados
  - `effect()` com `setInterval(15_000)` + `clearInterval` no cleanup
- [x] Testes Vitest: signal atualiza após fetch, computed reage a mudança de status, erro seta `apiError`

---

## Fase 6.2 – Componentes Principais ✅ concluída em 2026-05-03

### StatusBadgeComponent
- [x] Componente standalone com `input()` signal: `status: InputSignal<ExecucaoStatus>`
- [x] `computed()` interno derivando CSS class do status (não inline styles — jsdom normaliza hex para rgb)
- [x] CSS: classes por estado com cores específicas
- [x] Testes Vitest: renderiza CSS class e label corretos para cada um dos 9 estados

### DashboardTableComponent
- [x] Tabela com `@for` e `@if` via `mat-table` (Angular Material)
- [x] Colunas: Nome | Status (badge) | Última execução | Títulos | Próxima execução
- [x] Recebe `statusList = input<StatusCondominio[]>()` como signal
- [x] Ao clicar no nome: emitir `condominioSelecionado = output<number>()`
- [x] Indicador "Última atualização: HH:MM:SS" via `lastUpdate` do `PollingService`
- [x] Testes Vitest: render da tabela com dados mockados, click emite output correto

### AppComponent
- [x] `inject(PollingService)` — sem construtor explícito
- [x] Passa `status()` do signal para `DashboardTableComponent`
- [x] Exibe `ErrorBannerComponent` quando `apiError()` não é null
- [x] Gerencia `condominioSelecionadoId = signal<number | null>(null)` para historico

---

## Fase 6.3 – Histórico e Tratamento de Erros ✅ concluída em 2026-05-03

### HistoricoPanelComponent
- [x] Componente standalone com `condominioId = input<number | null>()`
- [x] `effect()` reage à mudança de `condominioId`: chama `StatusApiService.getHistorico()`
- [x] `historico = signal<ExecucaoHistorico[]>([])`
- [x] Exibe tabela com: data, período, status (badge), títulos, mensagem de erro
- [x] Estado de carregamento: spinner (`mat-spinner`) enquanto busca
- [x] Testes Vitest: carrega histórico ao receber id, limpa ao receber null

### ErrorBannerComponent
- [x] Exibe banner quando `apiError()` está setado
- [x] Botão "Tentar novamente" que aciona fetch imediato no `PollingService`
- [x] Auto-oculta quando próximo fetch for bem-sucedido

### NextRunChipComponent
- [x] Chip simples com `proximaExecucao` formatada (horário local `HH:MM`)
- [x] Cor: cinza se no futuro; amarelo se dentro de 5 min; cinza claro se passado

---

## Fase 6.4 – Testes e Cobertura ✅ concluída em 2026-05-03

- [x] Cobertura ≥ 80% em `services/` e componentes principais — resultado: **99.18% stmts, 93.1% funcs, 100% lines**
- [x] Cobrir cenários obrigatórios:
  - [x] `StatusBadgeComponent`: cada um dos 9 estados renderiza CSS class e label corretos
  - [x] `PollingService`: `computed()` `condominiosComFalha` reage quando status muda para `FALHA_TEMPORARIA`
  - [x] `PollingService`: erro HTTP seta `apiError` sem crashar a aplicação
  - [x] `DashboardTableComponent`: click no nome emite o `condominioId` correto
  - [x] `HistoricoPanelComponent`: `effect()` dispara `getHistorico` quando `condominioId` muda
  - [x] `AppComponent`: `ErrorBannerComponent` aparece e some conforme `apiError` signal

---

## Fase 6.5 – Build de Produção e Deploy ✅ concluída em 2026-05-03

- [x] `ng build --configuration production` — 437 kB initial, gzip ~107 kB
- [x] Confirmar que `environment.prod.ts` usa `apiBase` correto apontando para o servidor da API .NET
- [x] Validar que não há referências a `localhost:5000` hardcoded nos componentes
- [x] Documentar procedimento de deploy (ver `04-context.md` § Procedimento de Deploy):
  - Copiar `dist/dashboard-integracao-superlogica/browser/` para o servidor
  - Servir com Nginx ou IIS (configuração documentada)
  - Garantir que CORS na API .NET aceita a origem de produção
- [x] Cobertura final documentada: 99.18% stmts, 97.97% branches, 93.1% funcs, 100% lines
