import { IDataBaseObj } from './_base';
import { TableMap } from '../shared/table-map';

export interface IMateria extends IDataBaseObj {
    nombre?: string;
    tipoMateria?: string;
    areaMateria?: string;
}

export class Materia implements IMateria {
    static tableName: string = TableMap.Materia;

    id: string;

    nombre: string;
    tipoMateria: string;
    areaMateria: string;

    constructor(props: IMateria) {
        Object.keys(props).forEach(prop => {
            const value = props[prop];
            this[prop] = value;
        });
    }
}
