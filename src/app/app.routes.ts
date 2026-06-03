import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Tareas } from './pages/tareas/tareas';
import { Acerca } from './pages/acerca/acerca';
import { Kanban } from './pages/kanban/kanban';

export const routes: Routes = [
    {
        path: '',
        component: Inicio
    },
    {
        path: 'tareas',
        component: Tareas
    },
    {
        path: 'kanban',
        component: Kanban
    },
    {
        path: 'acerca',
        component: Acerca
    },
    {
        path: '**',
        redirectTo: ''
    }
];
