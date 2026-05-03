# Dashboard Integração Superlógica – Contexto de Entrega

> **Repositório**: `dashboard-integracao-superlogica`

## Estado Atual

**Fase 6.5 concluída. Todas as fases completas.** Build de produção OK: 437 kB initial (gzip ~107 kB). Cobertura Vitest: 99.18% statements, 93.1% functions, 100% lines. 39 testes passando. Sem localhost hardcoded em src/.

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
| CSS classes em vez de inline styles no `StatusBadgeComponent` | jsdom normaliza hex para `rgb()`, quebrando testes de cor; classes CSS são testáveis via `classList.contains()` |

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
| DashboardTable + StatusBadge com signals/computed | ✅ Fase 6.2 — 2026-05-03 |
| HistoricoPanel + ErrorBanner | ✅ Fase 6.3 — 2026-05-03 |
| Cobertura Vitest ≥ 80% | ✅ Fase 6.4 — 2026-05-03 (99.18% stmts, 93.1% funcs, 100% lines) |
| Build de produção + documentação de deploy | ✅ Fase 6.5 — 2026-05-03 |

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
./node_modules/.bin/ng test --watch=false --coverage --coverage-reporters=text  # cobertura
./node_modules/.bin/ng build --configuration development     # build dev
./node_modules/.bin/ng build --configuration production      # build prod
```

## Procedimento de Deploy (Fase 6.5)

### Pré-requisitos
- `environment.prod.ts` com `apiBase: 'http://servidor:5000'` apontando para a API .NET em produção
- CORS habilitado na API .NET para aceitar a origem do dashboard

### Build
```bash
./node_modules/.bin/ng build --configuration production
```
O artefato é gerado em `dist/dashboard-integracao-superlogica/browser/`.

### Servir com Nginx
```nginx
server {
    listen 80;
    root /var/www/dashboard/browser;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
```

### Servir com IIS
Copiar `dist/dashboard-integracao-superlogica/browser/` para o diretório raiz do site. Adicionar `web.config` com URL Rewrite para SPA:
```xml
<rewrite>
  <rules>
    <rule name="Angular Routes" stopProcessing="true">
      <match url=".*" />
      <conditions logicalGrouping="MatchAll">
        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
      </conditions>
      <action type="Rewrite" url="/" />
    </rule>
  </rules>
</rewrite>
```

### Validações pós-deploy
- [ ] `GET /api/status` acessível a partir do domínio de produção (CORS OK)
- [ ] Polling de 15 s funciona sem erros de CORS no console
- [ ] Banner de erro aparece ao desligar a API e some ao religar
