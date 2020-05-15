import {Component, Inject, OnDestroy, OnInit, Optional} from '@angular/core';
import {Carrera} from '../../models/Carrera';
import {DataService} from '../../shared/crud-service/data.service';
import {forkJoin, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Malla} from '../../models/Malla';
import {NotificacionService} from '../../shared/notificacion.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-mallas',
  templateUrl: './malla-f.component.html',
  styleUrls: ['./malla-f.component.css']
})
export class MallaFComponent implements OnInit, OnDestroy {
  private unsub: Subject<void> = new Subject<any>();

  carreras: Carrera[] = [];
  action: string;
  row: any;
  constructor(public materiaForm: MallaService,
              public DS: DataService,
              private NS: NotificacionService,
              public dialogRef: MatDialogRef<MallaFComponent>,
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
    const carreraObs = this.DS.readObs(Carrera);

    forkJoin([carreraObs])
      .pipe(takeUntil(this.unsub))
      .subscribe(
        (res: any) => {
          this.carreras = res[0];
        },
        err => this.mensaje(err)
      );
  }

  insertWithObs(row) {
    const mallaObs = this.DS.createObs(Malla, {id : row.id, descripcion : row.descripcion,
      carrera : row.carrera, periodo : row.periodo, curso: row.curso});
    mallaObs.pipe(takeUntil(this.unsub))
      .subscribe(
        (res: any) => {
          this.NS.success('Se ha guardado un nuevo registro');
          this.dialogRef.close({event: this.action, data: res});
        },
        err => this.mensaje(err)
      );
  }
  updateWithObs(row) {
    console.log(row);
    const mallaObs = this.DS.updateObs(Malla, {id : row.id, descripcion : row.descripcion});
    mallaObs.pipe(takeUntil(this.unsub))
      .subscribe(
        (res: any) => {
          this.NS.success('Se ha actualizado un registro');
          this.dialogRef.close({event: this.action, data: row});
        },
        err => this.mensaje(err)
      );
  }
  deleteWithObs(row) {
    const mallaObs = this.DS.deleteObs(Malla, {id : row.id, descripcion : row.descripcion});
    mallaObs.pipe(takeUntil(this.unsub))
      .subscribe(
        (res: any) => {
          this.NS.success('Se ha eliminado un registro');
          this.dialogRef.close({event: this.action, data: row});
        },
        err => this.mensaje(err)
      );
  }
}

export class MallaService {
  constructor() { }

  form: FormGroup = new FormGroup({
    id: new FormControl({value: '', disabled: true}, Validators.required),
    descripcion: new FormControl('', Validators.required),
    curso: new FormControl({value: 0, disabled: true}, Validators.required),
    periodo: new FormControl({value: 0, disabled: true}, Validators.required),
    carrera: new FormControl({value: '', disabled: true}, Validators.required),
  });
  initializeFormGroup() {
    this.form.setValue({
      id: '',
      descripcion: '',
      curso: 0,
      periodo: 0,
      carrera: '',
    });
    this.form.controls.id.enable();
    this.form.controls.curso.enable();
    this.form.controls.periodo.enable();
    this.form.controls.carrera.enable();
  }
  populateForm(row) {
    this.form.setValue({id : row.id, descripcion : row.descripcion,
      carrera : row.carrera, periodo : row.periodo, curso: row.curso});
    this.form.controls.id.disable();
    this.form.controls.curso.disable();
    this.form.controls.periodo.disable();
    this.form.controls.carrera.disable();
  }
}

