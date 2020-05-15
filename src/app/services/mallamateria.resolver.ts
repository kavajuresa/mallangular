import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Malla} from '../models/Malla';



@Injectable()
export class MallaMateriaResolver implements Resolve<Malla> {

  constructor(private http: HttpClient) {

  }

  resolve(route: ActivatedRouteSnapshot,
          state: RouterStateSnapshot): Observable<Malla> {
    return this.http.get<Malla>(`http://localhost:8000/api/malla/${route.params.id}`);
  }

}
