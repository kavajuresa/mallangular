import { IDataBaseObj } from './_base';
import { TableMap } from '../shared/table-map';

export interface ICarrera extends IDataBaseObj {
    nombre?: string;
}

export class Carrera implements ICarrera {
    static tableName: string = TableMap.Carrera;

    id: string;

    nombre: string;

    constructor(props: ICarrera) {
        Object.keys(props).forEach(prop => {
            const value = props[prop];
            this[prop] = value;
        });
    }
}
