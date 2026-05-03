import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HistoricoPanelComponent } from './historico-panel.component';
import { ExecucaoHistorico } from '../../models/execucao-status.model';

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

describe('HistoricoPanelComponent', () => {
  let fixture: ComponentFixture<HistoricoPanelComponent>;
  let component: HistoricoPanelComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoPanelComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideAnimationsAsync()]
    }).compileComponents();
    fixture = TestBed.createComponent(HistoricoPanelComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should not render panel when condominioId is null', () => {
    fixture.componentRef.setInput('condominioId', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-expansion-panel')).toBeNull();
  });

  it('should load historico when condominioId is set', () => {
    fixture.componentRef.setInput('condominioId', 1);
    TestBed.flushEffects();
    fixture.detectChanges();
    httpMock.expectOne('/api/execucoes/1').flush(mockHistorico);
    fixture.detectChanges();
    expect(component.historico()).toEqual(mockHistorico);
    expect(component.loading()).toBe(false);
  });

  it('should clear historico when condominioId changes to null', () => {
    fixture.componentRef.setInput('condominioId', 1);
    TestBed.flushEffects();
    fixture.detectChanges();
    httpMock.expectOne('/api/execucoes/1').flush(mockHistorico);
    fixture.detectChanges();
    expect(component.historico().length).toBe(1);

    fixture.componentRef.setInput('condominioId', null);
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(component.historico().length).toBe(0);
  });

  it('should set loading to false on HTTP error', () => {
    fixture.componentRef.setInput('condominioId', 99);
    TestBed.flushEffects();
    fixture.detectChanges();
    httpMock.expectOne('/api/execucoes/99').error(new ProgressEvent('error'));
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.historico()).toEqual([]);
  });

  it('should display historico rows after loading', () => {
    fixture.componentRef.setInput('condominioId', 1);
    TestBed.flushEffects();
    fixture.detectChanges();
    httpMock.expectOne('/api/execucoes/1').flush(mockHistorico);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('mat-row');
    expect(rows.length).toBe(1);
  });
});
