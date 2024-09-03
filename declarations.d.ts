declare module 'react-native-sqlite-storage' {
  export interface Transaction {
    executeSql(
      sqlStatement: string,
      args?: any[],
      callback?: (transaction: Transaction, resultSet: ResultSet) => void,
      errorCallback?: (transaction: Transaction, error: SQLError) => void,
    ): void;
  }

  export interface ResultSet {
    rows: {
      length: number;
      item(index: number): any;
    };
  }

  export interface SQLError {
    code: number;
    message: string;
  }

  export interface SQLiteDatabase {
    transaction(
      callback: (transaction: Transaction) => void,
      errorCallback?: (error: SQLError) => void,
      successCallback?: () => void,
    ): void;
  }

  export function openDatabase(
    params: {
      name: string;
      createFromLocation?: number;
      location?: string;
    },
    successCallback?: (db: SQLiteDatabase) => void,
    errorCallback?: (error: SQLError) => void,
  ): Promise<SQLiteDatabase>;
}
