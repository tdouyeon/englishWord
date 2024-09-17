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

// 데이터베이스 인스턴스를 가져오는 함수
export const getDatabase = (): SQLite.SQLiteDatabase | null => db;

export default db;
