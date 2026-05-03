import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';
import { ExecucaoStatus } from '../../models/execucao-status.model';
import { ComponentRef } from '@angular/core';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;
  let ref: ComponentRef<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(StatusBadgeComponent);
    ref = fixture.componentRef;
  });

  const cases: { status: ExecucaoStatus; cssClass: string; label: string }[] = [
    { status: 'A_PROCESSAR',              cssClass: 'status-a-processar',              label: 'A Processar' },
    { status: 'PROCESSAMENTO_FINALIZADO', cssClass: 'status-processamento-finalizado', label: 'Processamento Finalizado' },
    { status: 'ARQUIVO_BAIXADO',          cssClass: 'status-arquivo-baixado',          label: 'Arquivo Baixado' },
    { status: 'ENVIANDO_TITULOS',         cssClass: 'status-enviando-titulos',         label: 'Enviando Títulos' },
    { status: 'SEM_TITULOS',             cssClass: 'status-sem-titulos',              label: 'Sem Títulos' },
    { status: 'ENVIADO_SUPERLOGICA',     cssClass: 'status-enviado-superlogica',      label: 'Enviado Superlógica' },
    { status: 'FINALIZADO',              cssClass: 'status-finalizado',               label: 'Finalizado' },
    { status: 'FALHA_TEMPORARIA',        cssClass: 'status-falha-temporaria',         label: 'Falha Temporária' },
    { status: 'FALHA_PERMANENTE',        cssClass: 'status-falha-permanente',         label: 'Falha Permanente' }
  ];

  cases.forEach(({ status, cssClass, label }) => {
    it(`renders correct CSS class and label for ${status}`, () => {
      ref.setInput('status', status);
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement.querySelector('.badge');
      expect(el.classList.contains(cssClass)).toBe(true);
      expect(el.getAttribute('data-status')).toBe(status);
      expect(el.textContent?.trim()).toBe(label);
    });
  });
});
