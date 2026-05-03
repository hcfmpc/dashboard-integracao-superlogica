import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PollingService } from '../../services/polling.service';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    @if (polling.apiError()) {
      <div class="error-banner" role="alert">
        <mat-icon>error_outline</mat-icon>
        <span>{{ polling.apiError() }}</span>
        <button mat-stroked-button color="warn" (click)="retry()">Tentar novamente</button>
      </div>
    }
  `,
  styles: [`
    .error-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #ffebee;
      color: #b71c1c;
      border: 1px solid #ef9a9a;
      border-radius: 4px;
      padding: 12px 16px;
      margin-bottom: 16px;
    }
    mat-icon { flex-shrink: 0; }
    span { flex: 1; }
  `]
})
export class ErrorBannerComponent {
  readonly polling = inject(PollingService);

  retry(): void {
    this.polling.fetch();
  }
}
