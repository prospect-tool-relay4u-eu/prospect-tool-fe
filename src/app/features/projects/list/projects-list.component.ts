import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectService } from '../../../core/services/project.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-projects-list',
  imports: [NavbarComponent],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.css',
})
export class ProjectsListComponent {
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly destroyRef = inject(DestroyRef);

  readonly projects = this.projectService.projects;

  constructor() {
    this.projectService.loadProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  readonly showNewForm = signal(false);
  readonly newName = signal('');
  readonly newDesc = signal('');
  readonly deleteConfirmId = signal<number | null>(null);

  openNewForm(): void {
    this.showNewForm.set(true);
    this.newName.set('');
    this.newDesc.set('');
  }

  cancelNewForm(): void {
    this.showNewForm.set(false);
  }

  createProject(): void {
    const name = this.newName().trim();
    if (!name) return;
    this.projectService.createProject(name, this.newDesc().trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(project => {
        this.showNewForm.set(false);
        this.projectService.loadProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
        this.router.navigate(['/projects', project.id]);
      });
  }

  confirmDelete(id: number, event: Event): void {
    event.stopPropagation();
    this.deleteConfirmId.set(id);
  }

  cancelDelete(event: Event): void {
    event.stopPropagation();
    this.deleteConfirmId.set(null);
  }

  deleteProject(id: number, event: Event): void {
    event.stopPropagation();
    this.projectService.deleteProject(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.projectService.projects.update(list => list.filter(p => p.id !== id));
        this.deleteConfirmId.set(null);
      });
  }

  navigateTo(id: number): void {
    this.router.navigate(['/projects', id]);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
