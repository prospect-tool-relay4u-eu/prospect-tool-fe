import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProspectRecord } from '../models/project.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecordService {
  private readonly http = inject(HttpClient);

  getRecords(projectId: number): Observable<ProspectRecord[]> {
    return this.http.get<ProspectRecord[]>(`${environment.apiBase}/projects/${projectId}/records`);
  }

  createRecord(projectId: number): Observable<ProspectRecord> {
    return this.http.post<ProspectRecord>(`${environment.apiBase}/projects/${projectId}/records`, {});
  }

  updateRecord(recordId: string, values: Record<string, unknown>): Observable<ProspectRecord> {
    return this.http.put<ProspectRecord>(`${environment.apiBase}/records/${recordId}`, { values });
  }

  deleteRecord(recordId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiBase}/records/${recordId}`);
  }

  deleteAllRecords(projectId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBase}/projects/${projectId}/records`);
  }
}
