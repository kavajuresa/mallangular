import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {MallaMateria} from '../models/MallaMateria';
import {Malla} from '../models/Malla';


@Injectable()
export class MallaMateriaService {

  constructor(private http: HttpClient) {

  }

  findMallaById(id: number): Observable<Malla> {
    return this.http.get<Malla>(`http://localhost:8000/api/malla/${id}`);
  }

  findAllMalla(): Observable<Malla[]> {
    // @ts-ignore
    return this.http.get('http://localhost:8000/api/malla');
  }

  findAllMallaMateria(courseId: number): Observable<MallaMateria[]> {
    // @ts-ignore
    return this.http.get('http://localhost:8000/api/mallamateria', {
      params: new HttpParams()
        .set('courseId', courseId.toString())
        .set('pageNumber', '0')
        .set('pageSize', '1000')
    }).pipe(
      map(res =>  res)
    );
  }

  findMallaMateria(
    courseId: number, filter = '', sortOrder = 'asc',
    pageNumber = 0, pageSize = 3): Observable<MallaMateria[]> {

    // @ts-ignore
    return this.http.get('http://localhost:8000/api/mallamateria', {
      params: new HttpParams()
        .set('courseId', courseId.toString())
        .set('filter', filter)
        .set('sortOrder', sortOrder)
        .set('pageNumber', pageNumber.toString())
        .set('pageSize', pageSize.toString())
    }).pipe(
      map(res =>  res)
    );
  }

}
