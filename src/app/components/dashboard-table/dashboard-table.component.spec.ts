import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DashboardTableComponent } from './dashboard-table.component';
import { StatusCondominio } from '../../models/execucao-status.model';

const mockList: StatusCondominio[] = [
  {
    condominioId: 1,
    nome: 'Residencial Alpha',
    status: 'FINALIZADO',
    statusLabel: 'Finalizado',
    ultimaExecucao: '2024-01-01T10:00:00Z',
    totalTitulos: 5,
    proximaExecucao: '2024-01-02T10:00:00Z'
  },
  {
    condominioId: 2,
    nome: 'Condomínio Beta',
    status: 'FALHA_TEMPORARIA',
    statusLabel: 'Falha Temporária',
    ultimaExecucao: '2024-01-01T09:00:00Z',
    totalTitulos: 0,
    proximaExecucao: '2024-01-02T09:00:00Z'
  }
];

describe('DashboardTableComponent', () => {
  let fixture: ComponentFixture<DashboardTableComponent>;
  let component: DashboardTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTableComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideAnimationsAsync()]
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('statusList', mockList);
    fixture.detectChanges();
  });

  it('should render a row for each entry in statusList', () => {
    const rows = fixture.nativeElement.querySelectorAll('mat-row');
    expect(rows.length).toBe(2);
  });

  it('should display condominio names', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.link-btn');
    expect(buttons[0].textContent.trim()).toBe('Residencial Alpha');
    expect(buttons[1].textContent.trim()).toBe('Condomínio Beta');
  });

  it('should emit condominioSelecionado with correct id on name click', () => {
    let emittedId: number | undefined;
    component.condominioSelecionado.subscribe((id: number) => { emittedId = id; });
    const buttons = fixture.nativeElement.querySelectorAll('.link-btn');
    buttons[0].click();
    expect(emittedId).toBe(1);
  });

  it('should emit correct id for second row click', () => {
    let emittedId: number | undefined;
    component.condominioSelecionado.subscribe((id: number) => { emittedId = id; });
    const buttons = fixture.nativeElement.querySelectorAll('.link-btn');
    buttons[1].click();
    expect(emittedId).toBe(2);
  });

  it('should show no-data message when statusList is empty', () => {
    fixture.componentRef.setInput('statusList', []);
    fixture.detectChanges();
    const noData = fixture.nativeElement.querySelector('.no-data');
    expect(noData?.textContent?.trim()).toBe('Nenhum condomínio encontrado.');
  });
});
