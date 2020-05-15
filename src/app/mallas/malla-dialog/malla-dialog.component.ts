import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {FormBuilder, Validators, FormGroup} from '@angular/forms';

import {Malla} from '../../models/Malla';
import {AreaMateria} from '../../models/AreaMateria';
import {TipoMateria} from '../../models/TipoMateria';
import {Carrera} from '../../models/Carrera';
import {forkJoin} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-malla-dialog',
    templateUrl: './malla-dialog.component.html',
    styleUrls: ['./malla-dialog.component.css']
})
export class MallaDialogComponent implements OnInit {

    form: FormGroup;
    descripcion: string;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<MallaDialogComponent>,
        @Inject(MAT_DIALOG_DATA) {descripcion, curso,
            periodo, carrera}: Malla ) {

        this.descripcion = descripcion;


        this.form = fb.group({
            descripcion: [descripcion, Validators.required],
            curso: [curso, Validators.required],
            periodo: [periodo, Validators.required],
            carrera: [carrera, Validators.required]
        });

    }

    ngOnInit() {

    }


    save() {
        this.dialogRef.close(this.form.value);
    }

    close() {
        this.dialogRef.close();
    }
}
