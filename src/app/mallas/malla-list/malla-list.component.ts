import { Component, OnInit } from '@angular/core';
import {map} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {DataService} from '../../shared/crud-service/data.service';
import {Malla} from '../../models/Malla';

@Component({
  selector: 'app-malla-list',
  templateUrl: './malla-list.component.html',
  styleUrls: ['./malla-list.component.css']
})
export class MallaListComponent implements OnInit {
  carreraInformatica$: Observable<Malla[]>;

  carreraCivil$: Observable<Malla[]>;

  carreraElectronica$: Observable<Malla[]>;

  carreraElectricidad$: Observable<Malla[]>;

  constructor(private DS: DataService) {

  }

  ngOnInit() {

    const malla$: Observable<Malla[]> = this.DS.readObs(Malla);

    this.carreraInformatica$ = malla$.pipe(
      map(malla => malla.filter(res => res.carrera === 'KTII') )
    );

    this.carreraCivil$ = malla$.pipe(
      map(malla => malla.filter(res => res.carrera === 'KTIC') )
    );

    this.carreraElectronica$ = malla$.pipe(
      map(malla => malla.filter(res => res.carrera === 'KTIE') )
    );

    this.carreraElectricidad$ = malla$.pipe(
      map(malla => malla.filter(res => res.carrera === 'KTIL') )
    );

  }

}
