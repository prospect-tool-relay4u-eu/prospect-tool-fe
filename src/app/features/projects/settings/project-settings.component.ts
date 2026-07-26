import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FieldType, Project, generateSlug } from '../../../core/models/project.model';
import { ProjectService } from '../../../core/services/project.service';
import { RecordService } from '../../../core/services/record.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ErrorService } from '../../../core/services/error.service';
import { NotificationService } from '../../../core/services/notification.service';

const TYPE_DISPLAY: Record<FieldType, string> = {
  STRING: 'Text',
  BOOLEAN: 'Yes/No',
  INTEGER: 'Integer',
  NUMBER: 'Number',
};

@Component({
  selector: 'app-project-settings',
  imports: [RouterLink, NavbarComponent],
  templateUrl: './project-settings.component.html',
  styleUrl: './project-settings.component.css',
})
export class ProjectSettingsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly recordService = inject(RecordService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorService = inject(ErrorService);
  private readonly notifications = inject(NotificationService);

  readonly projectId = Number(this.route.snapshot.paramMap.get('id'));

  readonly project = signal<Project | undefined>(undefined);
  readonly sortedFields = computed(() =>
    [...(this.project()?.fields ?? [])].sort((a, b) => a.order - b.order)
  );

  readonly newFieldLabel = signal('');
  readonly newFieldType = signal<FieldType>('STRING');
  readonly fieldToDelete = signal<string | null>(null);
  readonly showClearConfirm = signal(false);
  readonly editingName = signal(false);
  readonly nameValue = signal('');
  readonly descValue = signal('');
  readonly addError = signal<string | null>(null);

  readonly fieldTypes: FieldType[] = ['STRING', 'BOOLEAN', 'INTEGER', 'NUMBER'];
  readonly typeDisplay = TYPE_DISPLAY;

  ngOnInit(): void {
    if (!this.projectId) {
      this.router.navigate(['/projects']);
      return;
    }
    this.refreshProject();
  }

  private refreshProject(): void {
    this.projectService.getProject(this.projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: p => this.project.set(p),
        error: err => this.notifyError(err),
      });
  }

  startEditName(): void {
    this.nameValue.set(this.project()?.name ?? '');
    this.descValue.set(this.project()?.description ?? '');
    this.editingName.set(true);
  }

  saveName(): void {
    const name = this.nameValue().trim();
    if (!name) return;
    this.projectService.updateProject(this.projectId, { name, description: this.descValue().trim() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.editingName.set(false);
          this.refreshProject();
        },
        error: err => this.notifyError(err),
      });
  }

  cancelEditName(): void {
    this.editingName.set(false);
  }

  addField(): void {
    const label = this.newFieldLabel().trim();
    if (!label) return;
    this.addError.set(null);

    const existingKeys = new Set(this.sortedFields().map(f => f.key));
    let key = generateSlug(label);
    if (!key) { this.addError.set('Invalid field name.'); return; }
    let counter = 2;
    while (existingKeys.has(key)) { key = `${generateSlug(label)}_${counter++}`; }

    this.projectService.addField(this.projectId, {
      key,
      label,
      type: this.newFieldType(),
      required: false,
      order: this.sortedFields().length,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.newFieldLabel.set('');
          this.newFieldType.set('STRING');
          this.refreshProject();
        },
        error: err => {
          const apiError = this.errorService.parse(err);
          this.addError.set(this.errorService.messageFor(apiError));
        },
      });
  }

  confirmDelete(fieldId: string): void {
    this.fieldToDelete.set(fieldId);
  }

  cancelDelete(): void {
    this.fieldToDelete.set(null);
  }

  deleteField(fieldId: string): void {
    this.projectService.removeField(this.projectId, fieldId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.fieldToDelete.set(null);
          this.refreshProject();
        },
        error: err => this.notifyError(err),
      });
  }

  moveFieldUp(fieldId: string): void {
    const fields = this.sortedFields();
    const idx = fields.findIndex(f => f.id === fieldId);
    if (idx <= 0) return;
    const ids = fields.map(f => f.id);
    [ids[idx], ids[idx - 1]] = [ids[idx - 1], ids[idx]];
    this.projectService.reorderFields(this.projectId, ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.refreshProject(),
        error: err => this.notifyError(err),
      });
  }

  moveFieldDown(fieldId: string): void {
    const fields = this.sortedFields();
    const idx = fields.findIndex(f => f.id === fieldId);
    if (idx < 0 || idx >= fields.length - 1) return;
    const ids = fields.map(f => f.id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    this.projectService.reorderFields(this.projectId, ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.refreshProject(),
        error: err => this.notifyError(err),
      });
  }

  clearRecords(): void {
    this.recordService.deleteAllRecords(this.projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.showClearConfirm.set(false),
        error: err => this.notifyError(err),
      });
  }

  private notifyError(err: unknown): void {
    const apiError = this.errorService.parse(err as HttpErrorResponse);
    this.notifications.error(this.errorService.messageFor(apiError));
  }
}
