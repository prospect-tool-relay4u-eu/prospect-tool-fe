import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProspectRecord } from '../models/project.model';

const API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class RecordService {
  private readonly http = inject(HttpClient);

  getRecords(projectId: number): Observable<ProspectRecord[]> {
    return this.http.get<ProspectRecord[]>(`${API}/projects/${projectId}/records`);
  }

  createRecord(projectId: number): Observable<ProspectRecord> {
    return this.http.post<ProspectRecord>(`${API}/projects/${projectId}/records`, {});
  }

  updateRecord(recordId: string, values: Record<string, unknown>): Observable<ProspectRecord> {
    return this.http.put<ProspectRecord>(`${API}/records/${recordId}`, { values });
  }

  deleteRecord(recordId: string): Observable<void> {
    return this.http.delete<void>(`${API}/records/${recordId}`);
  }

  deleteAllRecords(projectId: number): Observable<void> {
    return this.http.delete<void>(`${API}/projects/${projectId}/records`);
  }
}
