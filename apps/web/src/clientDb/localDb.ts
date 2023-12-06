import Dexie, { Table } from 'dexie';
import { T_Og_Select, T_Project_Select } from '../../../api/src/db/schemas';

export type T_TableDataType ={
  pg: T_Og_Select;
  project: T_Project_Select;
}

export const localdbStoresObj = {
  og: '++id, updated_at', // Primary key and indexed props
  project: '++id, updated_at',
};

export class LocalDbDexieClass extends Dexie {
  // We just tell the typing system this is the case
  og!: Table<T_Og_Select>; 
  project!: Table<T_Project_Select>;

  constructor() {
    super('subs_manager');
    this.version(1).stores(localdbStoresObj);
  }
};

export const LocalDB = new LocalDbDexieClass();