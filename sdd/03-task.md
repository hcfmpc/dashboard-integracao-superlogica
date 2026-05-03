# Dashboard Integração Superlógica – Backlog de Implementação

> **Repositório**: `dashboard-integracao-superlogica`
> **Pré-requisito**: API .NET rodando em `localhost:5000` com endpoints `/api/status`, `/api/condominios`, `/api/execucoes/{id}`

## Fase 6.1 – Setup e Polling

### Setup do projeto
- [ ] `ng new dashboard-integracao-superlogica --standalone --routing --style=scss`
- [ ] `ng add @angular/material` (tema personalizado ou pré-definido)
- [ ] Criar `proxy.conf.json` apontando `/api` → `http://localhost:5000`
- [ ] Configurar `vitest.config.ts` e `test-setup.ts` (padrão Angular v21)
- [ ] Criar `environments/environment.ts` (`apiBase: ''`) e `environment.prod.ts` (`apiBase: 'http://servidor:5000'`)
- [ ] Criar modelos TypeScript em `models/execucao-status.model.ts`:
  - `ExecucaoStatus` (union type com os 9 estados)
  - `StatusCondominio`, `ExecucaoHistorico`, `Condominio`

### StatusApiService
- [ ] Implementar `StatusApiService` com `inject(HttpClient)`:
  - `getStatus(): Observable<StatusCondominio[]>`
  - `getCondominios(): Observable<Condominio[]>`
  - `getHistorico(id: number): Observable<ExecucaoHistorico[]>`
- [ ] Testes Vitest com `HttpClientTestingModule`: 200 OK, erro de rede, payload malformado

### PollingService
- [ ] Implementar `PollingService` com:
  - `status = signal<StatusCondominio[]>([])`
  - `apiError = signal<string | null>(null)`
  - `lastUpdate = signal<Date | null>(null)`
  - `condominiosComFalha = computed(...)`: filtra falhas
  - `totalFinalizados = computed(...)`: conta finalizados
  - `effect()` com `setInterval(15_000)` + `clearInterval` no cleanup
- [ ] Testes Vitest: signal atualiza após fetch, computed reage a mudança de status, erro seta `apiError`

---

## Fase 6.2 – Componentes Principais

### StatusBadgeComponent
- [ ] Componente standalone com `input()` signal: `status: InputSignal<ExecucaoStatus>`
- [ ] `computed()` interno derivando cor e label do status
- [ ] CSS: variáveis CSS por estado; sem classes dinâmicas complexas
- [ ] Testes Vitest: renderiza cor correta para cada um dos 9 estados

### DashboardTableComponent
- [ ] Tabela com `@for` e `@if` (nova sintaxe Angular v17+)
- [ ] Colunas: Nome | Status (badge) | Última execução | Títulos | Próxima execução
- [ ] Recebe `statusList = input<StatusCondominio[]>()` como signal
- [ ] Ao clicar no nome: emitir `condominioSelecionado = output<number>()`
- [ ] Indicador "Última atualização: HH:MM:SS" via `lastUpdate` do `PollingService`
- [ ] Testes Vitest: render da tabela com dados mockados, click emite output correto

### AppComponent
- [ ] `inject(PollingService)` — sem construtor explícito
- [ ] Passa `status()` do signal para `DashboardTableComponent`
- [ ] Exibe `ErrorBannerComponent` quando `apiError()` não é null
- [ ] Gerencia `condominioSelecionadoId = signal<number | null>(null)` para historico

---

## Fase 6.3 – Histórico e Tratamento de Erros

### HistoricoPanelComponent
- [ ] Componente standalone com `condominioId = input<number | null>()`
- [ ] `effect()` reage à mudança de `condominioId`: chama `StatusApiService.getHistorico()`
- [ ] `historico = signal<ExecucaoHistorico[]>([])`
- [ ] Exibe tabela com: data, período, status (badge), títulos, mensagem de erro expandível
- [ ] Estado de carregamento: skeleton/spinner enquanto busca
- [ ] Testes Vitest: carrega histórico ao receber id, limpa ao receber null

### ErrorBannerComponent
- [ ] Exibe banner quando `apiError()` está setado
- [ ] Botão "Tentar novamente" que aciona fetch imediato no `PollingService`
- [ ] Auto-oculta quando próximo fetch for bem-sucedido

### NextRunChipComponent
- [ ] Chip simples com `proximaExecucao` formatada (horário local `HH:MM`)
- [ ] Cor: cinza se no futuro; amarelo se dentro de 5 min; sem alerta se passado

---

## Fase 6.4 – Testes e Cobertura

- [ ] Cobertura ≥ 80% em `services/` e componentes principais (`DashboardTableComponent`, `StatusBadgeComponent`, `HistoricoPanelComponent`)
- [ ] Cobrir cenários obrigatórios:
  - [ ] `StatusBadgeComponent`: cada um dos 9 estados renderiza cor e label corretos
  - [ ] `PollingService`: `computed()` `condominiosComFalha` reage quando status muda para `FALHA_TEMPORARIA`
  - [ ] `PollingService`: erro HTTP seta `apiError` sem crashar a aplicação
  - [ ] `DashboardTableComponent`: click no nome emite o `condominioId` correto
  - [ ] `HistoricoPanelComponent`: `effect()` dispara `getHistorico` quando `condominioId` muda
  - [ ] `AppComponent`: `ErrorBannerComponent` aparece e some conforme `apiError` signal

---

## Fase 6.5 – Build de Produção e Deploy

- [ ] `ng build --configuration production`
- [ ] Confirmar que `environment.prod.ts` usa `apiBase` correto apontando para o servidor da API .NET
- [ ] Validar que não há referências a `localhost:5000` hardcoded nos componentes
- [ ] Documentar procedimento de deploy:
  - Copiar `dist/dashboard-integracao-superlogica/browser/` para o servidor
  - Servir com Nginx, IIS ou outro servidor estático
  - Garantir que CORS na API .NET aceita a origem de produção
- [ ] `npx vitest --coverage` — cobertura final documentada
