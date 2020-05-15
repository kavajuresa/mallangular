import {Component, Inject, OnDestroy, OnInit, Optional} from '@angular/core';
import {DataService} from '../../../shared/crud-service/data.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {NotificacionService} from '../../../shared/notificacion.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TipoMateria} from '../../../models/TipoMateria';

@Component({
  selector: 'app-tipo-materia-f',
  templateUrl: './tipo-materia-f.component.html',
  styleUrls: ['./tipo-materia-f.component.css']
})

export class TipoMateriaFComponent implements OnInit, OnDestroy {
  private unsub: Subject<void> = new Subject<any>();
  action: string;
  row: any;
  constructor(public tipomateriaForm: TipoMateriaService,
              public DS: DataService,
              private NS: NotificacionService,
              public dialogRef: MatDialogRef<TipoMateriaFComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    this.row = {...data};
    this.action = this.row.action;
  }
  doAction(){
    if (this.action === 'Borrar') {
      this.deleteWithObs(this.row);
    } else {
      if (this.tipomateriaForm.form.valid) {
        if (this.action === 'Agregar') {
          this.insertWithObs(this.tipomateriaForm.form.value);
        } else if (this.action === 'Actualizar') {
          this.updateWithObs(this.tipomateriaForm.form.getRawValue());
        }
      }
    }
  }
  closeDialog(){
    this.tipomateriaForm.form.reset();
    this.tipomateriaForm.initializeFormGroup();
    this.dialogRef.close({event: 'Cancelar'});
  }
  onClear() {
    // const id = this.tipomateriaForm.form.get('id').value;
    this.action = 'Agregar';
    this.tipomateriaForm.form.reset();
    this.tipomateriaForm.initializeFormGroup();
    // this.tipomateriaForm.form.patchValue({ id });
  }

  ngOnInit() {
    if (this.action === 'Actualizar') {
      this.tipomateriaForm.populateForm(this.row);
    } else {
      this.tipomateriaForm.initializeFormGroup();
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
    const areamateriaObs = this.DS.createObs(TipoMateria, {id : row.id, nombre : row.nombre});
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
    const areamateriaObs = this.DS.updateObs(TipoMateria, {id : row.id, nombre : row.nombre});
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
    const areamateriaObs = this.DS.deleteObs(TipoMateria, {id : row.id, nombre : row.nombre});
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

export class TipoMateriaService {
  constructor() { }
  form: FormGroup = new FormGroup({
    id: new FormControl({value: '', disabled: true}, Validators.required),
    nombre: new FormControl('', Validators.required),
  });
  initializeFormGroup() {
    this.form.setValue({
      id: '',
      nombre: '',
    });
    this.form.controls.id.enable();
  }
  populateForm(row) {
    this.form.setValue({id : row.id, nombre : row.nombre});
    this.form.controls.id.disable();
  }
}
