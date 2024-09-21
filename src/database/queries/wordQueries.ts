import {getDatabase} from '../db';
import {WordData} from '../models/wordModel';

const db = getDatabase();

export const insertWord = (wordData: WordData) => {
  if (!db) {
    console.error('DB가 열리지 않았습니다.');
    return;
  }

  const {id, word, meaning, pronunciation, category, imageUri} = wordData;
  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO words (id, word, meaning, pronunciation, category, imageUri) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, word, meaning, pronunciation, category, imageUri],
      () => console.log('Word added successfully'),
      error => console.error('Error adding word: ', error),
    );
  });
};

export const getAllWords = (): Promise<WordData[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error('DB가 열리지 않았습니다.');
      reject('DB가 열리지 않았습니다.');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM words',
        [],
        (tx, results) => {
          const rows = results.rows;
          const words: WordData[] = [];

          for (let i = 0; i < rows.length; i++) {
            words.push(rows.item(i));
          }

          resolve(words);
        },
        error => {
          console.error('Error fetching words: ', error);
          reject(error);
        },
      );
    });
  });
};

export const getWordCount = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('DB가 열리지 않았습니다.');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(*) AS count FROM words',
        [],
        (tx, results) => {
          const count = results.rows.item(0).count;
          resolve(count);
        },
        (tx, error) => reject(`Error fetching word count: ${error.message}`),
      );
    });
  });
};

export const getCategoryWordCount = (category: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('DB가 열리지 않았습니다.');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(*) AS count FROM words WHERE category = ?',
        [category],
        (tx, results) => {
          const count = results.rows.item(0).count;
          resolve(count);
        },
        (tx, error) => reject(`Error fetching word count: ${error.message}`),
      );
    });
  });
};

export const getWordsByCategoryName = (
  categoryName: string,
): Promise<WordData[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('DB가 열리지 않았습니다.');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM words WHERE category = ?',
        [categoryName],
        (tx, results) => {
          const rows = results.rows;
          const words: WordData[] = [];

          for (let i = 0; i < rows.length; i++) {
            words.push(rows.item(i));
          }

          resolve(words);
        },
        (tx, error) =>
          reject(`Error fetching words by category: ${error.message}`),
      );
    });
  });
};

export const updateWord = (wordData: WordData) => {
  if (!db) {
    console.error('DB가 열리지 않았습니다.');
    return;
  }

  const {id, word, meaning, pronunciation, category, imageUri} = wordData;
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE words SET word = ?, meaning = ?, pronunciation = ?, category = ?, imageUri = ? WHERE id = ?`,
      [word, meaning, pronunciation, category, imageUri, id],
      () => console.log('Word updated successfully'),
      error => console.error('Error updating word: ', error),
    );
  });
};

export const deleteWord = (word: string) => {
  if (!db) {
    console.error('DB가 열리지 않았습니다.');
    return;
  }

  db.transaction(tx => {
    tx.executeSql(
      `DELETE FROM words WHERE word = ?`,
      [word],
      () => console.log('Word deleted successfully'),
      error => console.error('Error deleting word: ', error),
    );
  });
};
