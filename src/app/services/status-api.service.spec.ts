import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { StatusApiService } from './status-api.service';
import { StatusCondominio, Condominio, ExecucaoHistorico } from '../models/execucao-status.model';

const mockStatus: StatusCondominio[] = [
  {
    condominioId: 1,
    nome: 'Condomínio Teste',
    status: 'FINALIZADO',
    statusLabel: 'Finalizado',
    ultimaExecucao: '2024-01-01T10:00:00Z',
    totalTitulos: 5,
    proximaExecucao: '2024-01-02T10:00:00Z'
  }
];

const mockCondominios: Condominio[] = [
  { id: 1, nome: 'Condomínio Teste', ativo: true, proximaExecucao: '2024-01-02T10:00:00Z' }
];

const mockHistorico: ExecucaoHistorico[] = [
  {
    id: 1,
    dataInicial: '2024-01-01T00:00:00Z',
    dataFinal: '2024-01-01T23:59:59Z',
    status: 'FINALIZADO',
    totalRegistros: 5,
    mensagemErro: null,
    executadoEm: '2024-01-01T10:00:00Z'
  }
];

describe('StatusApiService', () => {
  let service: StatusApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(StatusApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should fetch status list', () => {
    service.getStatus().subscribe(data => {
      expect(data).toEqual(mockStatus);
    });
    const req = httpMock.expectOne('/api/status');
    expect(req.request.method).toBe('GET');
    req.flush(mockStatus);
  });

  it('should propagate network error on getStatus', () => {
    let errorReceived = false;
    service.getStatus().subscribe({
      error: () => { errorReceived = true; }
    });
    const req = httpMock.expectOne('/api/status');
    req.error(new ProgressEvent('network error'));
    expect(errorReceived).toBe(true);
  });

  it('should fetch condominios list', () => {
    service.getCondominios().subscribe(data => {
      expect(data).toEqual(mockCondominios);
    });
    const req = httpMock.expectOne('/api/condominios');
    expect(req.request.method).toBe('GET');
    req.flush(mockCondominios);
  });

  it('should fetch historico for a given id', () => {
    service.getHistorico(1).subscribe(data => {
      expect(data).toEqual(mockHistorico);
    });
    const req = httpMock.expectOne('/api/execucoes/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockHistorico);
  });
});
