import { Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';

type ChipState = 'future' | 'soon' | 'past';

@Component({
  selector: 'app-next-run-chip',
  standalone: true,
  imports: [DatePipe],
  template: `
    <span class="chip" [class]="chipClass()">
      {{ proximaExecucao() | date:'HH:mm' }}
    </span>
  `,
  styles: [`
    .chip {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 500;
    }
    .future { background: #e0e0e0; color: #5c5c5c; }
    .soon   { background: #fff9c4; color: #f57f17; }
    .past   { background: #eeeeee; color: #9e9e9e; }
  `]
})
export class NextRunChipComponent {
  readonly proximaExecucao = input.required<string>();

  readonly chipClass = computed<ChipState>(() => {
    const diff = new Date(this.proximaExecucao()).getTime() - Date.now();
    if (diff < 0) return 'past';
    if (diff <= 5 * 60 * 1000) return 'soon';
    return 'future';
  });
}
