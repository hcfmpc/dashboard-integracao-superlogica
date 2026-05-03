# Documentação Técnica – Dashboard Integração Superlógica

> **Repositório**: `dashboard-integracao-superlogica`
> Contrato REST consumido: [sdd global §02-plan](../../sdd/02-plan.md#contrato-rest)

## 1. Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Angular | v21 |
| Standalone | Sim | — |
| Reatividade | Angular Signals + Computed | nativo Angular v17+ |
| UI | Angular Material | v21 |
| HTTP | `HttpClient` com `inject()` | nativo Angular |
| Testes | Vitest + Angular Testing Library | padrão Angular v21 |
| Build | Angular CLI | v21 |
| Estilos | SCSS + variáveis CSS | — |

## 2. Fluxo Reativo

```
PollingService
  signal<StatusCondominio[]>()  ← atualizado pelo setInterval (15s)
       │
       ├── computed: condominiosComFalha[]  ← reage automaticamente
       ├── computed: totalFinalizados       ← idem
       └── signal: apiError                ← setado em caso de falha HTTP

AppComponent
  inject(PollingService)
  passa status() → DashboardTableComponent
  passa apiError() → ErrorBannerComponent
  gerencia condominioSelecionadoId = signal<number | null>(null)
       │
       └── passa para HistoricoPanelComponent
               effect() reage a condominioId:
               chama getHistorico() → historico = signal<ExecucaoHistorico[]>()
```

## 3. Componentes

### `StatusBadgeComponent`

```typescript
@Component({ standalone: true, ... })
export class StatusBadgeComponent {
  status = input.required<ExecucaoStatus>();
  cor = computed(() => STATUS_CORES[this.status()]);
  label = computed(() => STATUS_LABELS[this.status()]);
}
```

Constantes de mapeamento em `models/execucao-status.model.ts`.

### `DashboardTableComponent`

```typescript
statusList = input.required<StatusCondominio[]>();
condominioSelecionado = output<number>();
```

Usa `@for (item of statusList(); track item.condominioId)` (sintaxe Angular v17+).

### `PollingService` (trecho de referência)

```typescript
readonly status = signal<StatusCondominio[]>([]);
readonly apiError = signal<string | null>(null);
readonly condominiosComFalha = computed(() =>
  this.status().filter(s => s.status.startsWith('FALHA'))
);
```

## 4. Endpoints Consumidos

Todos via proxy em dev (`/api/*` → `localhost:5000`), diretamente em prod.

| Endpoint | Método | Usado por |
|---|---|---|
| `/api/status` | GET | `PollingService` (polling 15s) |
| `/api/condominios` | GET | `StatusApiService` (carregamento inicial) |
| `/api/execucoes/{id}` | GET | `HistoricoPanelComponent` (sob demanda) |

Modelos de resposta: ver `models/execucao-status.model.ts` e [sdd global §02-plan](../../sdd/02-plan.md#contrato-rest).

## 5. Badges de Status

| `ExecucaoStatus` | Label | Cor |
|---|---|---|
| `A_PROCESSAR` | A PROCESSAR | `#9e9e9e` |
| `PROCESSAMENTO_FINALIZADO` | PROCESSAMENTO FINALIZADO | `#42a5f5` |
| `ARQUIVO_BAIXADO` | ARQUIVO BAIXADO | `#1976d2` |
| `ENVIANDO_TITULOS` | ENVIANDO TÍTULOS BAIXADOS | `#fb8c00` |
| `SEM_TITULOS` | NÃO HÁ TÍTULOS BAIXADOS | `#66bb6a` |
| `ENVIADO_SUPERLOGICA` | ENVIADO À SUPERLÓGICA | `#43a047` |
| `FINALIZADO` | FINALIZADO BAIXA DE TÍTULOS | `#2e7d32` |
| `FALHA_TEMPORARIA` | FALHA (reprocessando…) | `#e53935` |
| `FALHA_PERMANENTE` | FALHA PERMANENTE ⚠ | `#b71c1c` |

## 6. Proxy de Desenvolvimento

`proxy.conf.json`:
```json
{ "/api": { "target": "http://localhost:5000", "secure": false, "changeOrigin": true } }
```

`ng serve --proxy-config proxy.conf.json`

## 7. Ambiente de Desenvolvimento

```bash
node --version   # >= 22 LTS recomendado para Angular v21
npm install -g @angular/cli@21
ng new dashboard-integracao-superlogica --standalone --routing --style=scss
ng add @angular/material
ng serve --proxy-config proxy.conf.json   # http://localhost:4200
npx vitest                                # testes
npx vitest --coverage                     # relatório de cobertura
ng build --configuration production
```

## 8. Configuração Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    coverage: { provider: 'v8', reporter: ['text', 'html'] }
  }
});
```

## 9. Pendências Técnicas

| Item | Status |
|---|---|
| API .NET com endpoints funcionais para integração com dados reais | ⬜ Fase 5 da API |
| Origem de produção confirmada para configuração de CORS na API | ⬜ Antes da Fase 6.5 |
| Decisão de servidor estático para produção (Nginx / IIS / outro) | ⬜ Antes da Fase 6.5 |
