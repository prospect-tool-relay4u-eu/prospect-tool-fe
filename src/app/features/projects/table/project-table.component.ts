import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FieldDefinition, Project, ProspectRecord } from '../../../core/models/project.model';
import { ProjectService } from '../../../core/services/project.service';
import { RecordService } from '../../../core/services/record.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AutoFocusDirective } from '../../../shared/directives/auto-focus.directive';

const TYPE_LABELS: Record<string, string> = {
  STRING: 'tekst',
  BOOLEAN: 'tak/nie',
  INTEGER: 'liczba',
  NUMBER: 'liczba',
};

@Component({
  selector: 'app-project-table',
  imports: [RouterLink, NavbarComponent, AutoFocusDirective],
  templateUrl: './project-table.component.html',
  styleUrl: './project-table.component.css',
})
export class ProjectTableComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly recordService = inject(RecordService);
  private readonly destroyRef = inject(DestroyRef);

  readonly projectId = Number(this.route.snapshot.paramMap.get('id'));

  readonly project = toSignal(this.projectService.getProject(this.projectId));
  readonly records = signal<ProspectRecord[]>([]);

  readonly sortedFields = computed(() =>
    [...(this.project()?.fields ?? [])].sort((a, b) => a.order - b.order)
  );

  readonly editingCell = signal<{ recordId: string; fieldKey: string } | null>(null);

  ngOnInit(): void {
    if (!this.projectId) {
      this.router.navigate(['/projects']);
      return;
    }
    this.recordService.getRecords(this.projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(records => this.records.set(records));
  }

  addRecord(): void {
    this.recordService.createRecord(this.projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(record => {
        this.records.update(list => [...list, record]);
        const firstTextField = this.sortedFields().find(f => f.type !== 'BOOLEAN');
        if (firstTextField) {
          this.editingCell.set({ recordId: record.id, fieldKey: firstTextField.key });
        }
      });
  }

  startEdit(recordId: string, fieldKey: string): void {
    this.editingCell.set({ recordId, fieldKey });
  }

  cancelEdit(): void {
    this.editingCell.set(null);
  }

  commitEdit(event: Event, recordId: string, field: FieldDefinition): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    const record = this.records().find(r => r.id === recordId);
    if (!record) return;

    let parsed: unknown = raw === '' ? null : raw;
    if (field.type === 'INTEGER') parsed = raw === '' ? null : parseInt(raw, 10);
    if (field.type === 'NUMBER') parsed = raw === '' ? null : parseFloat(raw);

    const newValues = { ...record.values, [field.key]: parsed };
    this.recordService.updateRecord(recordId, newValues)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(updated => {
        this.records.update(list => list.map(r => r.id === recordId ? updated : r));
        this.editingCell.set(null);
      });
  }

  toggleBoolean(recordId: string, fieldKey: string): void {
    const record = this.records().find(r => r.id === recordId);
    if (!record) return;
    const current = record.values[fieldKey] === true;
    const newValues = { ...record.values, [fieldKey]: !current };
    this.recordService.updateRecord(recordId, newValues)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(updated => {
        this.records.update(list => list.map(r => r.id === recordId ? updated : r));
      });
  }

  isEditing(recordId: string, fieldKey: string): boolean {
    const cell = this.editingCell();
    return cell?.recordId === recordId && cell?.fieldKey === fieldKey;
  }

  getCellValue(record: ProspectRecord, field: FieldDefinition): string {
    const val = record.values[field.key];
    if (val == null) return '';
    return String(val);
  }

  displayValue(record: ProspectRecord, field: FieldDefinition): string {
    const val = record.values[field.key];
    if (val == null || val === '') return '';
    if ((field.type === 'INTEGER' || field.type === 'NUMBER') && typeof val === 'number') {
      return val.toLocaleString('pl-PL');
    }
    return String(val);
  }

  getBoolValue(record: ProspectRecord, fieldKey: string): boolean {
    return record.values[fieldKey] === true;
  }

  typeLabel(type: string): string {
    return TYPE_LABELS[type] ?? type;
  }

  deleteRecord(id: string): void {
    this.recordService.deleteRecord(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.records.update(list => list.filter(r => r.id !== id));
      });
  }

  recordCountLabel(count: number): string {
    if (count === 1) return '1 rekord';
    if (count >= 2 && count <= 4) return `${count} rekordy`;
    return `${count} rekordów`;
  }
}
