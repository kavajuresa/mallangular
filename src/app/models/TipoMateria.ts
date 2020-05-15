import { TableMap } from './../shared/table-map';
import { IDataBaseObj } from './_base';

export interface ITipoMateria extends IDataBaseObj {
    nombre?: string;
}

export class TipoMateria implements ITipoMateria {
    static tableName: string = TableMap.TipoMateria;

    id: string;

    nombre?: string;

    constructor(props: ITipoMateria) {
        Object.keys(props).forEach(prop => {
            const value = props[prop];
            this[prop] = value;
        });
    }
}
