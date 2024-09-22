import {Platform} from 'react-native';
import SQLite from 'react-native-sqlite-storage';

let db: SQLite.SQLiteDatabase | null = null;

const openDatabaseAsync = (): Promise<SQLite.SQLiteDatabase> => {
  return new Promise<SQLite.SQLiteDatabase>((resolve, reject) => {
    SQLite.openDatabase(
      {
        name: 'testDB.sqlite',
        createFromLocation: 1,
        location: 'default',
      },
      dbInstance => resolve(dbInstance),
      error => reject(error),
    );
  });
};

export const dbOpen = async (): Promise<void> => {
  if (db) return;

  try {
    db = await openDatabaseAsync();
    console.log(`${Platform.OS}에서 DB 열기 성공`);
    await initializeTables();
  } catch (error) {
    console.error('DB 열기 실패: ', error);
  }
};

const initializeTables = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE
          )`,
          [],
          () => {
            console.log('Categories table created successfully');
          },
          (tx, error) => {
            console.error('Error creating categories table: ', error);
            reject(error);
            return false;
          },
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS words (
            id TEXT PRIMARY KEY,
            word TEXT,
            meaning TEXT,
            pronunciation TEXT,
            category TEXT,
            imageUri TEXT,
            FOREIGN KEY (category) REFERENCES categories (id)
          )`,
          [],
          () => {
            console.log('Words table created successfully');
            resolve();
          },
          (tx, error) => {
            console.error('Error creating words table: ', error);
            reject(error);
            return false;
          },
        );
      });
    } else {
      reject('Database not initialized');
    }
  });
};

// 모든 데이터 삭제
export const clearDatabase = async (): Promise<void> => {
  if (!db) {
    console.error('Database not initialized');
    return;
  }

  try {
    await new Promise<void>((resolve, reject) => {
      db?.transaction(tx => {
        tx.executeSql(
          'DELETE FROM words',
          [],
          () => {
            console.log('Words table cleared successfully');
          },
          (tx, error) => {
            console.error('Error clearing words table: ', error);
            reject(error);
          },
        );

        tx.executeSql(
          'DELETE FROM categories',
          [],
          () => {
            console.log('Categories table cleared successfully');
            resolve();
          },
          (tx, error) => {
            console.error('Error clearing categories table: ', error);
            reject(error);
          },
        );
      });
    });
  } catch (error) {
    console.error('Error clearing database: ', error);
  }
};

// 데이터베이스 인스턴스를 가져오는 함수
export const getDatabase = (): SQLite.SQLiteDatabase | null => db;

export default db;
