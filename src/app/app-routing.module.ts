import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MallaListComponent} from './mallas/malla-list/malla-list.component';
import {MallaMateriaComponent} from './malla-materia/malla-materia.component';
import {MallaMateriaResolver} from './services/mallamateria.resolver';
import {AreaMateriaComponent} from './materias/areas/list-table/area-materia.component';
import {MateriaComponent} from './materias/list-table/materia.component';
import {MateriaFComponent} from './materias/form-dialog/materia-f.component';
import {TipoMateriaComponent} from './materias/tipos/list-table/tipo-materia.component';
import {MallaComponent} from './mallas/list-table/malla.component';


const routes: Routes = [
  {path: '', redirectTo: 'malla', pathMatch: 'full'},
  {path: 'malla', component: MallaComponent},
  {path: 'malla/:carrera/:id', component: MallaMateriaComponent, resolve:{
    mallamateria: MallaMateriaResolver
  }},
  {path: 'areamateria', component: AreaMateriaComponent},
  {path: 'materia', component: MateriaComponent},
  {path: 'tipo', component: TipoMateriaComponent},
  {path: '**', redirectTo: '/'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
