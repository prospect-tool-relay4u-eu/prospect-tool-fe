import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FieldDefinition, Project, ProjectSummary } from '../models/project.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);

  readonly projects = signal<ProjectSummary[]>([]);

  loadProjects(): Observable<ProjectSummary[]> {
    return this.http.get<ProjectSummary[]>(`${environment.apiBase}/projects`).pipe(
      tap(list => this.projects.set(list))
    );
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${environment.apiBase}/projects/${id}`);
  }

  createProject(name: string, description: string): Observable<Project> {
    return this.http.post<Project>(`${environment.apiBase}/projects`, { name, description });
  }

  updateProject(id: number, data: { name: string; description: string }): Observable<Project> {
    return this.http.put<Project>(`${environment.apiBase}/projects/${id}`, data);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBase}/projects/${id}`);
  }

  addField(projectId: number, data: Omit<FieldDefinition, 'id'>): Observable<FieldDefinition> {
    return this.http.post<FieldDefinition>(`${environment.apiBase}/projects/${projectId}/fields`, data);
  }

  removeField(projectId: number, fieldId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiBase}/projects/${projectId}/fields/${fieldId}`);
  }

  reorderFields(projectId: number, fieldIds: string[]): Observable<FieldDefinition[]> {
    return this.http.put<FieldDefinition[]>(`${environment.apiBase}/projects/${projectId}/fields/order`, { fieldIds });
  }
}
