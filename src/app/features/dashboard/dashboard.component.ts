import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
}
