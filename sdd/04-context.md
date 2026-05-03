# Dashboard Integração Superlógica – Contexto de Entrega

> **Repositório**: `dashboard-integracao-superlogica`

## Estado Atual

**Fase 6.1 concluída.** Angular v21 inicializado, Angular Material instalado, serviços de polling implementados e testados. 14 testes Vitest passando. Build de desenvolvimento OK.

## Premissas Confirmadas

| Premissa | Fonte |
|---|---|
| Angular v21 com standalone components | Decisão de arquitetura |
| Vitest é o framework de testes padrão do Angular v21 | Confirmado — `@angular/build:unit-test` já integra Vitest |
| Signals e Computed são uso prioritário (sem RxJS complexo) | Decisão de arquitetura |
| Dashboard em porta :4200 em desenvolvimento | Decisão de arquitetura |
| API .NET em porta :5000 | Decisão de arquitetura |
| Proxy Angular (`proxy.conf.json`) para dev; CORS na API para produção | Decisão de arquitetura |
| Contrato REST (3 endpoints + modelo ExecucaoStatus) definido no SDD global | [sdd global §02-plan](../../sdd/02-plan.md) |
| O dashboard não exibe dados financeiros (valores, CPF, nosso-número) | Regra de segurança global |
| Angular Material v21 para componentes UI | Instalado com tema `azure-blue` (Material Design 3) |

## Decisões Técnicas

| Decisão | Justificativa |
|---|---|
| Signals + Computed em vez de RxJS/NgRx | Menor boilerplate; reatividade granular suficiente para painel simples; padrão Angular v21 |
| Vitest em vez de Jasmine/Karma | Padrão Angular v21; mais rápido; integração nativa com `@angular/build:unit-test` |
| Proxy de dev em vez de CORS em dev | Evita configurar CORS extra; produção usa CORS diretamente |
| Polling de 15 s por `effect()` + `setInterval` | Sem WebSocket ou SSE; latência aceitável para painel de monitoramento diário |
| Angular Material (tema `azure-blue`) para UI | Componentes acessíveis e consistentes sem escrever CSS de tabela do zero. `indigo-pink` foi descontinuado no M3. |
| `TestBed.flushEffects()` em testes de services | `effect()` não dispara automaticamente no ambiente Vitest; é necessário chamar explicitamente antes de resolver os mocks HTTP |
| `provideAnimationsAsync()` no `app.config.ts` | Requerido pelo Angular Material v21; `@angular/animations` instalado separadamente pois não era dependência gerada pelo `ng new` |

## Dependências de Outros Times/Projetos

| Dependência | Status | Impacto |
|---|---|---|
| API .NET com `GET /api/status` funcional | ⬜ Fase 5 da API | Necessário para Fase 6.2 com dados reais (mock em 6.1) |
| API .NET com `GET /api/execucoes/{id}` | ⬜ Fase 5 da API | Necessário para `HistoricoPanelComponent` (Fase 6.3) |
| CORS configurado na API para origem de produção | ⬜ Fase 5 da API | Necessário para Fase 6.5 (build prod) |

## Riscos

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| API .NET indisponível durante desenvolvimento | Média | Baixo | Mock local com `provideHttpClientTesting()` e dados fixture |
| Mudança no contrato REST da API | Baixa | Médio | Contrato canônico no SDD global; atualizar modelos TypeScript |
| CORS bloqueando dashboard em produção | Baixa | Alto | Testar CORS no ambiente de staging antes do go-live |

## Marcos

| Marco | Status |
|---|---|
| SDD dashboard concluído | ✅ |
| Setup Angular v21 + PollingService com signal | ✅ Fase 6.1 — 2026-05-03 |
| DashboardTable + StatusBadge com signals/computed | ⬜ Fase 6.2 |
| HistoricoPanel + ErrorBanner | ⬜ Fase 6.3 |
| Cobertura Vitest ≥ 80% | ⬜ Fase 6.4 |
| Build de produção + documentação de deploy | ⬜ Fase 6.5 |

## Fragmentos Críticos Implementados

### PollingService — padrão de testes com `flushEffects`

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()]
  });
  service = TestBed.inject(PollingService);
  TestBed.flushEffects(); // obrigatório para disparar o effect() do constructor
  httpMock = TestBed.inject(HttpTestingController);
  httpMock.expectOne('/api/status').flush(mockData);
});
```

### Comandos de desenvolvimento

```bash
./node_modules/.bin/ng serve --proxy-config proxy.conf.json  # dev server :4200
./node_modules/.bin/ng test --watch=false                    # testes Vitest
./node_modules/.bin/ng build --configuration development     # build dev
./node_modules/.bin/ng build --configuration production      # build prod
```
