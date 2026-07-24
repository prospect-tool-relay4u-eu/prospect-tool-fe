import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { StagingCodePopupComponent } from './shared/staging-code-popup/staging-code-popup.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StagingCodePopupComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor() {
    inject(ThemeService);
  }
}
