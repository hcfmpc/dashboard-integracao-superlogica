import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PollingService } from './polling.service';
import { StatusCondominio } from '../models/execucao-status.model';

const mockData: StatusCondominio[] = [
  {
    condominioId: 1,
    nome: 'Teste',
    status: 'FINALIZADO',
    statusLabel: 'Finalizado',
    ultimaExecucao: '2024-01-01T10:00:00Z',
    totalTitulos: 3,
    proximaExecucao: '2024-01-02T10:00:00Z'
  },
  {
    condominioId: 2,
    nome: 'Falha',
    status: 'FALHA_TEMPORARIA',
    statusLabel: 'Falha Temporária',
    ultimaExecucao: '2024-01-01T10:00:00Z',
    totalTitulos: 0,
    proximaExecucao: '2024-01-02T10:00:00Z'
  }
];

describe('PollingService', () => {
  let service: PollingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PollingService);
    // Flush the effect so the initial fetch fires
    TestBed.flushEffects();
    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('/api/status').flush(mockData);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should update status signal after successful fetch', () => {
    expect(service.status()).toEqual(mockData);
  });

  it('should update lastUpdate after successful fetch', () => {
    expect(service.lastUpdate()).toBeInstanceOf(Date);
  });

  it('should clear apiError after successful fetch', () => {
    expect(service.apiError()).toBeNull();
  });

  it('computed condominiosComFalha should react to status changes', () => {
    expect(service.condominiosComFalha().length).toBe(1);
    expect(service.condominiosComFalha()[0].condominioId).toBe(2);
  });

  it('computed totalFinalizados should count FINALIZADO entries', () => {
    expect(service.totalFinalizados()).toBe(1);
  });

  it('should set apiError when HTTP request fails', () => {
    service.fetch();
    httpMock.expectOne('/api/status').error(new ProgressEvent('network error'));
    expect(service.apiError()).toBe('Não foi possível conectar ao servidor.');
  });

  it('should not throw when fetch errors occur', () => {
    expect(() => {
      service.fetch();
      httpMock.expectOne('/api/status').error(new ProgressEvent('error'));
    }).not.toThrow();
  });

  it('computed condominiosComFalha includes FALHA_PERMANENTE', () => {
    const withPermanent: StatusCondominio[] = [
      { ...mockData[0], status: 'FALHA_PERMANENTE' }
    ];
    service.status.set(withPermanent);
    expect(service.condominiosComFalha().length).toBe(1);
    expect(service.condominiosComFalha()[0].status).toBe('FALHA_PERMANENTE');
  });
});
