import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ErrorBannerComponent } from './error-banner.component';
import { PollingService } from '../../services/polling.service';

describe('ErrorBannerComponent', () => {
  let fixture: ComponentFixture<ErrorBannerComponent>;
  let httpMock: HttpTestingController;
  let polling: PollingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorBannerComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideAnimationsAsync()]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    polling = TestBed.inject(PollingService);
    // Flush the PollingService constructor effect
    TestBed.flushEffects();
    httpMock.expectOne('/api/status').flush([]);
    fixture = TestBed.createComponent(ErrorBannerComponent);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should not display banner when no error', () => {
    expect(fixture.nativeElement.querySelector('.error-banner')).toBeNull();
  });

  it('should display banner when apiError is set', () => {
    polling.apiError.set('Não foi possível conectar ao servidor.');
    fixture.detectChanges();
    const banner = fixture.nativeElement.querySelector('.error-banner');
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain('Não foi possível conectar ao servidor.');
  });

  it('retry button should call polling.fetch()', () => {
    polling.apiError.set('Erro de rede.');
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    btn.click();
    const req = httpMock.expectOne('/api/status');
    req.flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.error-banner')).toBeNull();
  });
});
