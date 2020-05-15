import { TableMap } from './../shared/table-map';
import { IDataBaseObj } from './_base';

export interface IAreaMateria extends IDataBaseObj {
    nombre?: string;
    color?: string;
}

export class AreaMateria implements IAreaMateria {
    static tableName: string = TableMap.AreaMateria;

    id: string;

    nombre?: string;
    color?: string;

    constructor(props: IAreaMateria) {
        Object.keys(props).forEach(prop => {
            const value = props[prop];
            this[prop] = value;
        });
    }
}
