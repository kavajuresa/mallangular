import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {MaterialModule} from './module/module.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from './app-routing.module';
import {MallaCardListComponent} from './mallas/malla-card-list/malla-card-list.component';
import {MallaListComponent} from './mallas/malla-list/malla-list.component';
import {MallaDialogComponent} from './mallas/malla-dialog/malla-dialog.component';
import {AreaMateriaComponent} from './materias/areas/list-table/area-materia.component';
import {MallaMateriaComponent} from './malla-materia/malla-materia.component';
import {MallaMateriaResolver} from './services/mallamateria.resolver';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MateriaFComponent, MateriaService} from './materias/form-dialog/materia-f.component';
import { MateriaComponent } from './materias/list-table/materia.component';
import {CrudServiceModule} from './shared/crud-service/crud-service.module';
import {AreaMateriaFComponent, AreaMateriaService} from './materias/areas/form-dialog/area-materia-f.component';
import {TipoMateriaComponent} from './materias/tipos/list-table/tipo-materia.component';
import {TipoMateriaFComponent, TipoMateriaService} from './materias/tipos/form-dialog/tipo-materia-f.component';
import {MallaComponent} from './mallas/list-table/malla.component';
import {MallaFComponent, MallaService} from './mallas/form-dialog/malla-f.component';
import {GojsAngularModule} from 'gojs-angular';
import {InspectorComponent} from './inspector/inspector.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {PdfService} from './services/pdf.service';

@NgModule({
  declarations: [
    AppComponent,
    InspectorComponent,
    // MallaListComponent,
    // MallaCardListComponent,
    // MallaDialogComponent,
    MallaMateriaComponent,
    MallaComponent,
    MallaFComponent,
    MateriaFComponent,
    MateriaComponent,
    AreaMateriaComponent,
    AreaMateriaFComponent,
    TipoMateriaComponent,
    TipoMateriaFComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    MaterialModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    CrudServiceModule,
    FormsModule,
    GojsAngularModule,
    DragDropModule,
  ],
  providers: [MallaMateriaResolver
    , MallaService, MateriaService, AreaMateriaService, TipoMateriaService,
    PdfService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    // MallaDialogComponent
    MallaFComponent, MateriaFComponent, AreaMateriaFComponent, TipoMateriaFComponent
  ]
})
export class AppModule { }
