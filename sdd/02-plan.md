# Dashboard Integração Superlógica – Plano Técnico

> **Repositório**: `dashboard-integracao-superlogica`

## 1. Stack

| Camada | Tecnologia |
|---|---|
| Framework | Angular v21 (standalone components) |
| Reatividade | Angular Signals (`signal`, `computed`, `effect`) — uso prioritário |
| HTTP | `HttpClient` com `inject()` no service |
| Roteamento | Angular Router (rota única `/`) |
| Estilo | Angular Material v21 + CSS customizado (variáveis CSS) |
| Testes | Vitest (padrão Angular v21) + Angular Testing Library |
| Build | Angular CLI (`ng build`) |
| Dev server | `ng serve` na porta `:4200`; proxy para API em `:5000` |

### Por que Signals e Computed?

- `signal<StatusCondominio[]>()` armazena o estado do polling: sem `BehaviorSubject`, sem `async pipe` obrigatório.
- `computed()` deriva estado automaticamente: filtros, contadores, ordenação — atualizados só quando a fonte muda.
- `effect()` aciona o polling periódico de forma declarativa e limpa.
- Sem `NgRx` ou `RxJS` complexo: reatividade granular com menos boilerplate para um painel simples.

## 2. Componentes

| Componente | Responsabilidade |
|---|---|
| `AppComponent` | Shell; inicializa polling via `effect()` |
| `DashboardTableComponent` | Tabela principal com todos os condomínios |
| `StatusBadgeComponent` | Badge colorido por `ExecucaoStatus` (input signal) |
| `HistoricoPanelComponent` | Histórico expansível; carregado sob demanda |
| `ErrorBannerComponent` | Banner de indisponibilidade da API |
| `NextRunChipComponent` | Chip com horário da próxima execução |

## 3. Services

| Service | Responsabilidade |
|---|---|
| `StatusApiService` | `HttpClient` para os 3 endpoints da API .NET |
| `PollingService` | `setInterval` gerenciado com `signal<StatusCondominio[]>()` |
| `ExecucaoStatusPipe` | `Pipe` que converte enum → label legível |

## 4. Modelo de Dados (TypeScript)

```typescript
// Enum espelhado do backend (contrato global)
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
  ultimaExecucao: string;    // ISO 8601
  totalTitulos: number;
  proximaExecucao: string;   // ISO 8601
}

export interface ExecucaoHistorico {
  id: number;
  dataInicial: string;
  dataFinal: string;
  status: ExecucaoStatus;
  totalRegistros: number;
  mensagemErro: string | null;
  executadoEm: string;       // ISO 8601
}

export interface Condominio {
  id: number;
  nome: string;
  ativo: boolean;
  proximaExecucao: string;
}
```

## 5. Estratégia de Reatividade com Signals

```typescript
// PollingService
export class PollingService {
  private http = inject(HttpClient);

  // Estado central como signal
  readonly status = signal<StatusCondominio[]>([]);
  readonly apiError = signal<string | null>(null);
  readonly lastUpdate = signal<Date | null>(null);

  // Computed: condomínios com falha (reage automaticamente)
  readonly condominiosComFalha = computed(() =>
    this.status().filter(s =>
      s.status === 'FALHA_TEMPORARIA' || s.status === 'FALHA_PERMANENTE')
  );

  // Computed: total de finalizados no ciclo atual
  readonly totalFinalizados = computed(() =>
    this.status().filter(s => s.status === 'FINALIZADO').length
  );

  constructor() {
    // Polling via effect + setInterval
    effect((onCleanup) => {
      const id = setInterval(() => this.fetch(), 15_000);
      this.fetch(); // busca imediata
      onCleanup(() => clearInterval(id));
    });
  }

  private fetch(): void {
    this.http.get<StatusCondominio[]>('/api/status').subscribe({
      next: data => { this.status.set(data); this.lastUpdate.set(new Date()); this.apiError.set(null); },
      error: err => this.apiError.set('Não foi possível conectar ao servidor.')
    });
  }
}
```

## 6. Proxy de Desenvolvimento

`proxy.conf.json` para redirecionar `/api/*` para a API .NET em `:5000`:

```json
{
  "/api": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true
  }
}
```

`angular.json`:
```json
"serve": {
  "options": { "proxyConfig": "proxy.conf.json" }
}
```

Em produção: não há proxy — dashboard e API em portas separadas; CORS configurado na API .NET.

## 7. Estratégia de Testes (Vitest)

| Tipo | Ferramentas | O que cobrir |
|---|---|---|
| Unitários (services) | Vitest + `HttpClientTestingModule` | `PollingService`: atualização de signal, erro de API, `computed` derivados |
| Unitários (componentes) | Vitest + Angular Testing Library | `StatusBadgeComponent`: cor por status; `DashboardTableComponent`: render da tabela |
| Integração | Vitest + `TestBed` + mock HTTP | Fluxo completo: fetch → signal → render do badge |

Configuração Vitest:
```typescript
// vitest.config.ts (gerado pelo Angular CLI v21)
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts']
  }
});
```

## 8. Estrutura de Diretórios

```text
dashboard-integracao-superlogica/
├── sdd/                      ← este SDD
├── angular.json
├── proxy.conf.json
├── vitest.config.ts
├── tsconfig.json
└── src/
    ├── app/
    │   ├── app.component.ts
    │   ├── app.config.ts          ← provideHttpClient(), provideRouter()
    │   ├── app.routes.ts
    │   ├── components/
    │   │   ├── dashboard-table/
    │   │   │   ├── dashboard-table.component.ts
    │   │   │   └── dashboard-table.component.spec.ts
    │   │   ├── status-badge/
    │   │   │   ├── status-badge.component.ts
    │   │   │   └── status-badge.component.spec.ts
    │   │   ├── historico-panel/
    │   │   │   ├── historico-panel.component.ts
    │   │   │   └── historico-panel.component.spec.ts
    │   │   ├── error-banner/
    │   │   │   └── error-banner.component.ts
    │   │   └── next-run-chip/
    │   │       └── next-run-chip.component.ts
    │   ├── services/
    │   │   ├── status-api.service.ts
    │   │   ├── status-api.service.spec.ts
    │   │   └── polling.service.ts
    │   ├── models/
    │   │   └── execucao-status.model.ts
    │   └── pipes/
    │       └── execucao-status.pipe.ts
    ├── environments/
    │   ├── environment.ts          ← apiBase: '' (usa proxy)
    │   └── environment.prod.ts     ← apiBase: 'http://servidor:5000'
    ├── index.html
    ├── main.ts
    ├── styles.scss
    └── test-setup.ts
```

## 9. Comandos

```bash
ng new dashboard-integracao-superlogica --standalone --routing --style=scss
cd dashboard-integracao-superlogica
ng add @angular/material
ng serve --proxy-config proxy.conf.json   # dev: http://localhost:4200
npx vitest                                # testes
npx vitest --coverage                     # cobertura
ng build --configuration production       # build para produção
```

## 10. Fases de Entrega

| Fase | Entregável |
|---|---|
| **6.1** | Setup Angular v21 + Material, `PollingService` com signal, proxy de dev |
| **6.2** | `DashboardTableComponent` + `StatusBadgeComponent` com signals e computed |
| **6.3** | `HistoricoPanelComponent` (lazy load), `ErrorBannerComponent` |
| **6.4** | Testes Vitest, cobertura ≥ 80% em services e componentes principais |
| **6.5** | Build de produção e documentação de deploy |
