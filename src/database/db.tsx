import {Platform} from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const openDatabaseAsync = () => {
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

export const dbOpen = async () => {
  try {
    const db = await openDatabaseAsync();
    console.log(`${Platform.OS}에서 DB 열기 성공`);

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM tb_info',
        [],
        (tx, results) => {
          const rows = results.rows;
          for (let i = 0; i < rows.length; i++) {
            console.log(rows.item(i));
          }
        },
        (tx, error) => {
          console.log('쿼리 에러: ', error);
        },
      );
    });
  } catch (error) {
    console.error('DB 열기 실패: ', error);
  }
};
