import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-staging-code-popup',
  templateUrl: './staging-code-popup.component.html',
  styleUrl: './staging-code-popup.component.css',
})
export class StagingCodePopupComponent {
  private readonly auth = inject(AuthService);

  readonly stagingCode = this.auth.stagingCode;

  dismiss(): void {
    this.auth.clearStagingCode();
  }
}
