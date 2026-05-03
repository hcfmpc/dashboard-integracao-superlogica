import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { App } from './app';
import { PollingService } from './services/polling.service';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideAnimationsAsync()]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    TestBed.flushEffects();
    httpMock.expectOne('/api/status').flush([]);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render dashboard-table', () => {
    const fixture = TestBed.createComponent(App);
    TestBed.flushEffects();
    httpMock.expectOne('/api/status').flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-dashboard-table')).toBeTruthy();
  });

  it('should not show error-banner when apiError is null', () => {
    const fixture = TestBed.createComponent(App);
    TestBed.flushEffects();
    httpMock.expectOne('/api/status').flush([]);
    fixture.detectChanges();
    const banner = fixture.nativeElement.querySelector('.error-banner');
    expect(banner).toBeNull();
  });

  it('should show error-banner when apiError is set', () => {
    const fixture = TestBed.createComponent(App);
    TestBed.flushEffects();
    httpMock.expectOne('/api/status').error(new ProgressEvent('error'));
    fixture.detectChanges();
    const banner = fixture.nativeElement.querySelector('.error-banner');
    expect(banner).toBeTruthy();
  });

  it('should hide error-banner after successful fetch', () => {
    const fixture = TestBed.createComponent(App);
    const polling = TestBed.inject(PollingService);
    TestBed.flushEffects();
    httpMock.expectOne('/api/status').error(new ProgressEvent('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.error-banner')).toBeTruthy();

    polling.fetch();
    httpMock.expectOne('/api/status').flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.error-banner')).toBeNull();
  });
});
