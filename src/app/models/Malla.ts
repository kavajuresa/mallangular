import { IDataBaseObj } from './_base';
import { TableMap } from '../shared/table-map';

export interface IMalla extends IDataBaseObj {
    descripcion?: string;
    curso?: number;
    periodo?: number;

    fechaCreado?: Date;
    fechaModificado?: Date;

    carrera: string;
}

export class Malla implements IMalla {
    static tableName: string = TableMap.Malla;

    id: string;

    descripcion: string;
    curso: number;
    periodo: number;

    fechaCreado: Date;
    fechaModificado: Date;

    carrera: string;

    constructor(props: IMalla) {
        Object.keys(props).forEach(prop => {
            const value = props[prop];
            this[prop] = value;
        });
    }
}
