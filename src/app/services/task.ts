import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
 
import { Task } from '../models/task';
 
@Injectable({
  providedIn: 'root'
})
export class TaskService {
 
  private apiUrl = '/api/tareas';
 
  constructor(private http: HttpClient) {}
 
  obtenerTareas(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }
 
  obtenerPorId(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }
 
  agregarTarea(tarea: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, tarea);
  }
 
  actualizarTarea(tarea: Task): Observable<Task> {
    return this.http.put<Task>(
      `${this.apiUrl}/${tarea.id}`,
      tarea
    );
  }
 
  eliminarTarea(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}