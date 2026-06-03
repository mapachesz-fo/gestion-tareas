import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DragDropModule, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { Task } from '../../models/task';
import { TaskService } from '../../services/task';

@Component({
  selector: 'app-kanban',
  imports: [
    DatePipe,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
  ],
  templateUrl: './kanban.html',
  styleUrl: './kanban.css',
})
export class Kanban implements OnInit {
  pendientes: Task[] = [];
  enProceso: Task[] = [];
  finalizados: Task[] = [];

  private readonly estadoPorId: Record<string, string> = {
    'Pendiente': 'Pendiente',
    'En-proceso': 'En proceso',
    'Finalizada': 'Finalizada',
  };

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.cargarTareas();
  }

  cargarTareas() {
    this.taskService.obtenerTareas().subscribe({
      next: (todas) => {
        this.pendientes = todas.filter(t => t.estado === 'Pendiente');
        this.enProceso = todas.filter(t => t.estado === 'En proceso');
        this.finalizados = todas.filter(t => t.estado === 'Finalizada');
      },
      error: (err) => console.error(err),
    });
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) return;

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );

    const task = event.container.data[event.currentIndex];
    const nuevoEstado = this.estadoPorId[event.container.id] ?? event.container.id;

    task.estado = nuevoEstado;
    this.taskService.actualizarTarea(task).subscribe({
      error: (err) => console.error(err),
    });
  }

  eliminarTarea(task: Task) {
    if (!confirm('¿Está seguro de eliminar la tarea?')) return;
    this.taskService.eliminarTarea(task.id).subscribe({
      next: () => this.cargarTareas(),
      error: (err) => console.error(err),
    });
  }
}
