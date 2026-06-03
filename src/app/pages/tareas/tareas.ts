import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';

import { Task } from '../../models/task';
import { TaskService } from '../../services/task';

@Component({
  selector: 'app-tareas',
  imports: [
    FormsModule,
    DatePipe,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
  ],
  templateUrl: './tareas.html',
  styleUrl: './tareas.css',
})
export class Tareas implements OnInit {
  dataSource = new MatTableDataSource<Task>();

  columnas: string[] = [
    'id',
    'titulo',
    'estado',
    'prioridad',
    'fecha',
    'descripcion',
    'acciones',
  ];

  nuevaTarea: Task = {
    id: 0,
    titulo: '',
    estado: '',
    prioridad: '',
    fechaCreacion: new Date().toISOString().split('T')[0],
    descripcion: '',
  };

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.cargarTareas();
  }

  cargarTareas() {
    this.taskService.obtenerTareas().subscribe({
      next: (datos) => {
        this.dataSource.data = datos;
      }, 
      error: (error) => {
        console.error(error);
      }
    });
  }

  get pendientes(): number {
    return this.dataSource.data.filter(t => t.estado === 'Pendiente').length;
  }

  get enProceso(): number {
    return this.dataSource.data.filter(t => t.estado === 'En proceso').length;
  }

  get finalizados(): number {
    return this.dataSource.data.filter(t => t.estado === 'Finalizada').length;
  }

  agregarTarea() {
    if (
      !this.nuevaTarea.titulo ||
      !this.nuevaTarea.estado ||
      !this.nuevaTarea.prioridad ||
      !this.nuevaTarea.fechaCreacion ||
      !this.nuevaTarea.descripcion
    ) {
      alert('Debe completar todos los campos');
      return;
    }

    const tarea: Task = {
      id: Date.now(),
      titulo: this.nuevaTarea.titulo,
      estado: this.nuevaTarea.estado,
      prioridad: this.nuevaTarea.prioridad,
      fechaCreacion: this.nuevaTarea.fechaCreacion,
      descripcion: this.nuevaTarea.descripcion,
    };

    this.taskService.agregarTarea(tarea).subscribe({
      next: (tareaCreada) => {
        this.dataSource.data = [...this.dataSource.data, tareaCreada];

        this.limpiarFormulario();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  eliminarTarea(id: number) {
    const confirmar = confirm('¿Está seguro de eliminar la tarea?');

    if (!confirmar) {
      return;
    }

    this.taskService.eliminarTarea(id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter(t => t.id !== id);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  cambiarEstado(tarea: Task) {
    const tareaActualizada: Task = { ...tarea,
      estado: tarea.estado === 'Pendiente' ? 'En proceso' :
              tarea.estado === 'En proceso' ? 'Finalizada' : 'Pendiente'
     };

    this.taskService.actualizarTarea(tareaActualizada).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.map(
          (t: Task) => {
            if (t.id === tareaActualizada.id) {
              return tareaActualizada;
            }
            return t;
          }
        );
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  limpiarFormulario() {
    this.nuevaTarea = {
      id: 0,
      titulo: '',
      estado: '',
      prioridad: '',
      fechaCreacion: new Date().toISOString().split('T')[0],
      descripcion: '',
    };
  }

  obtenerClaseEstado(estado: string) {
    if (estado === 'Pendiente') {
      return 'etiqueta estado-pendiente';
    } else if (estado === 'En proceso') {
      return 'etiqueta estado-proceso';
    } else {
      return 'etiqueta estado-finalizada';
    }
  }

  obtenerClasePrioridad(prioridad: string) {
    if (prioridad === 'Alta') {
      return 'etiqueta prioridad-alta';
    } else if (prioridad === 'Media') {
      return 'etiqueta prioridad-media';
    } else {
      return 'etiqueta prioridad-baja';
    }
  }

  existenTareas() {
    return this.dataSource.data.length > 0;
  }
}

