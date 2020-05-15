import {Component, Input, OnInit} from '@angular/core';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import {MallaDialogComponent} from '../malla-dialog/malla-dialog.component';
import {Malla} from '../../models/Malla';

@Component({
    selector: 'app-malla-card-list',
    templateUrl: './malla-card-list.component.html',
    styleUrls: ['./malla-card-list.component.css']
})
export class MallaCardListComponent implements OnInit {

    @Input()
    malla: Malla[];

    constructor(private dialog: MatDialog) {
    }

    ngOnInit() {

    }

    editCourse({descripcion, curso, periodo, carrera}: Malla) {

        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;

        dialogConfig.data = {
            descripcion, curso, periodo, carrera
        };

        const dialogRef = this.dialog.open(MallaDialogComponent,
            dialogConfig);


        dialogRef.afterClosed().subscribe(
            val => console.log('ssdsdfasff:', val)
        );

    }

}









