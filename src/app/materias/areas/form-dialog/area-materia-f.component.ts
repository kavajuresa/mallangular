import {Component, Inject, OnDestroy, OnInit, Optional} from '@angular/core';
import {AreaMateria} from '../../../models/AreaMateria';
import {DataService} from '../../../shared/crud-service/data.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {NotificacionService} from '../../../shared/notificacion.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-area-materia-f',
  templateUrl: './area-materia-f.component.html',
  styleUrls: ['./area-materia-f.component.css']
})
export class AreaMateriaFComponent implements OnInit, OnDestroy {
  private unsub: Subject<void> = new Subject<any>();
  action: string;
  row: any;
  constructor(public areamateriaForm: AreaMateriaService,
              public DS: DataService,
              private NS: NotificacionService,
              public dialogRef: MatDialogRef<AreaMateriaFComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    this.row = {...data};
    this.action = this.row.action;
  }
  doAction(){
    if (this.action === 'Borrar') {
      this.deleteWithObs(this.row);
    } else {
      if (this.areamateriaForm.form.valid) {
        if (this.action === 'Agregar') {
          this.insertWithObs(this.areamateriaForm.form.value);
        } else if (this.action === 'Actualizar') {
          this.updateWithObs(this.areamateriaForm.form.getRawValue());
        }
      }
    }
  }
  closeDialog(){
    this.areamateriaForm.form.reset();
    this.areamateriaForm.initializeFormGroup();
    this.dialogRef.close({event: 'Cancelar'});
  }
  onClear() {
    // const id = this.areamateriaForm.form.get('id').value;
    this.action = 'Agregar';
    this.areamateriaForm.form.reset();
    this.areamateriaForm.initializeFormGroup();
    // this.areamateriaForm.form.patchValue({ id });
  }

  ngOnInit() {
    if (this.action === 'Actualizar') {
      this.areamateriaForm.populateForm(this.row);
    } else {
      this.areamateriaForm.initializeFormGroup();
    }
  }
  ngOnDestroy() {
    this.unsub.next();
    this.unsub.complete();
  }
  mensaje(err) {
    this.NS.warn(err.error[Object.keys(err.error)[0]]);
  }

  insertWithObs(row) {
    const areamateriaObs = this.DS.createObs(AreaMateria, {id : row.id, nombre : row.nombre, color: row.color});
    areamateriaObs.pipe(takeUntil(this.unsub))
      .subscribe(
        (res: any) => {
          this.NS.success('Se ha guardado un nuevo registro');
          this.dialogRef.close({event: this.action, data: res});
        },
        err => this.mensaje(err)
      );
  }
  updateWithObs(row) {
    const areamateriaObs = this.DS.updateObs(AreaMateria, {id : row.id, nombre : row.nombre, color: row.color});
    areamateriaObs.pipe(takeUntil(this.unsub))
      .subscribe(
        (res: any) => {
          this.NS.success('Se ha actualizado un registro');
          this.dialogRef.close({event: this.action, data: row});
        },
        err => this.mensaje(err)
      );
  }
  deleteWithObs(row) {
    const areamateriaObs = this.DS.deleteObs(AreaMateria, {id : row.id, nombre : row.nombre, color: row.color});
    areamateriaObs.pipe(takeUntil(this.unsub))
      .subscribe(
        (res: any) => {
          this.NS.success('Se ha eliminado un registro');
          this.dialogRef.close({event: this.action, data: row});
        },
        err => this.mensaje(err)
      );
  }
}
export class AreaMateriaService {
  constructor() { }

  form: FormGroup = new FormGroup({
    id: new FormControl({value: '', disabled: true}, Validators.required),
    nombre: new FormControl('', Validators.required),
    color: new FormControl('', Validators.required)
  });
  initializeFormGroup() {
    this.form.setValue({
      id: '',
      nombre: '',
      color: '',
    });
    this.form.controls.id.enable();
  }
  populateForm(row) {
    this.form.setValue({id : row.id, nombre : row.nombre, color: row.color});
    this.form.controls.id.disable();
  }
}
