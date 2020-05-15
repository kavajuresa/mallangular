import {Component, Inject, OnDestroy, OnInit, Optional} from '@angular/core';
import {AreaMateria} from '../../models/AreaMateria';
import {TipoMateria} from '../../models/TipoMateria';
import {Carrera} from '../../models/Carrera';
import {DataService} from '../../shared/crud-service/data.service';
import {forkJoin, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Materia} from '../../models/Materia';
import {NotificacionService} from '../../shared/notificacion.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-materias',
  templateUrl: './materia-f.component.html',
  styleUrls: ['./materia-f.component.css']
})
export class MateriaFComponent implements OnInit, OnDestroy {
  private unsub: Subject<void> = new Subject<any>();
  areamaterias: AreaMateria[] = [];
  tipomaterias: TipoMateria[] = [];
  carreras: Carrera[] = [];
  action: string;
  row: any;
  constructor(public materiaForm: MateriaService,
              public DS: DataService,
              private NS: NotificacionService,
              public dialogRef: MatDialogRef<MateriaFComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    this.row = {...data};
    this.action = this.row.action;
  }
  doAction(){
    if (this.action === 'Borrar') {
      this.deleteWithObs(this.row);
    } else {
      if (this.materiaForm.form.valid) {
        if (this.action === 'Agregar') {
          this.insertWithObs(this.materiaForm.form.value);
        } else if (this.action === 'Actualizar') {
          this.updateWithObs(this.materiaForm.form.getRawValue());
        }
      }
    }
  }
  closeDialog(){
    this.materiaForm.form.reset();
    this.materiaForm.initializeFormGroup();
    this.dialogRef.close({event: 'Cancelar'});
  }
  onClear() {
    // const id = this.materiaForm.form.get('id').value;
    this.action = 'Agregar';
    this.materiaForm.form.reset();
    this.materiaForm.initializeFormGroup();
    // this.materiaForm.form.patchValue({ id });
  }

  ngOnInit() {
    this.readWithObs();
    if (this.action === 'Actualizar') {
      this.materiaForm.populateForm(this.row);
    } else {
      this.materiaForm.initializeFormGroup();
    }
  }
  ngOnDestroy() {
    this.unsub.next();
    this.unsub.complete();
  }
  mensaje(err) {
    this.NS.warn(err.error[Object.keys(err.error)[0]]);
  }
  readWithObs() {
    const areaMateriaObs = this.DS.readObs(AreaMateria);
    const tipoMateriaObs = this.DS.readObs(TipoMateria);
    const carreraObs = this.DS.readObs(Carrera);

    forkJoin([areaMateriaObs, tipoMateriaObs, carreraObs])
      .pipe(takeUntil(this.unsub))
      .subscribe(
        (res: any) => {
          this.areamaterias = res[0];
          this.tipomaterias = res[1];
          this.carreras = res[2];
        },
        err => this.mensaje(err)
      );
  }

  insertWithObs(row) {
    const materiaObs = this.DS.createObs(Materia, {id : row.id, nombre : row.nombre,
      area_materia : row.area_materia, tipo_materia : row.tipo_materia});
    materiaObs.pipe(takeUntil(this.unsub))
      .subscribe(
        (res: any) => {
          this.NS.success('Se ha guardado un nuevo registro');
          this.dialogRef.close({event: this.action, data: res});
        },
        err => this.mensaje(err)
      );
  }
  updateWithObs(row) {
    const materiaObs = this.DS.updateObs(Materia, {id : row.id, nombre : row.nombre,
      area_materia : row.area_materia, tipo_materia : row.tipo_materia});
    materiaObs.pipe(takeUntil(this.unsub))
      .subscribe(
        (res: any) => {
          this.NS.success('Se ha actualizado un registro');
          this.dialogRef.close({event: this.action, data: row});
        },
        err => this.mensaje(err)
      );
  }
  deleteWithObs(row) {
    const materiaObs = this.DS.deleteObs(Materia, {id : row.id, nombre : row.nombre,
      area_materia : row.area_materia, tipo_materia : row.tipo_materia});
    materiaObs.pipe(takeUntil(this.unsub))
      .subscribe(
        (res: any) => {
          this.NS.success('Se ha eliminado un registro');
          this.dialogRef.close({event: this.action, data: row});
        },
        err => this.mensaje(err)
      );
  }
}

export class MateriaService {
  constructor() { }

  form: FormGroup = new FormGroup({
    id: new FormControl({value: '', disabled: true}, Validators.required),
    nombre: new FormControl('', Validators.required),
    area_materia: new FormControl('', Validators.required),
    tipo_materia: new FormControl('', Validators.required),
  });
  initializeFormGroup() {
    this.form.setValue({
      id: '',
      nombre: '',
      area_materia: '',
      tipo_materia: '',
    });
    this.form.controls.id.enable();
  }
  populateForm(row) {
    this.form.setValue({id : row.id, nombre : row.nombre,
      area_materia : row.area_materia, tipo_materia : row.tipo_materia});
    this.form.controls.id.disable();
  }
}

