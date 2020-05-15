import { IDataBaseObj } from './_base';
import { TableMap } from '../shared/table-map';

export interface IMallaMateria extends IDataBaseObj {
    horaPractica?: number;
    horaTeorica?: number;

    materia?: string;
    curso?: number;
    periodo?: number;
    malla?:number;
}

export class MallaMateria implements IMallaMateria {
    static tableName: string = TableMap.MallaMateria;
    id: string;
    malla: number;

    horaPractica: number;
    horaTeorica: number;

    materia: string;
    curso: number;
    periodo: number;

    constructor(props: IMallaMateria) {
        Object.keys(props).forEach(prop => {
            const value = props[prop];
            this[prop] = value;
        });
    }
}
