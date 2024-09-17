import {getDatabase} from '../db';

const db = getDatabase();

export const addCategory = async (name: string) => {
  if (!db) {
    console.error('Database not opened');
    return;
  }

  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO categories (name) VALUES (?)`,
      [name],
      () => console.log('Category added successfully'),
      error => console.error('Error adding category: ', error),
    );
  });
};

export const getAllCategories = async (): Promise<
  {id: number; name: string}[]
> => {
  console.log(db, '있지요?');
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('Database not opened');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM categories`,
        [],
        (tx, results) => {
          const rows = results.rows;
          const categories = [];

          for (let i = 0; i < rows.length; i++) {
            categories.push(rows.item(i));
          }

          resolve(categories);
        },
        (tx, error) => reject(`Error fetching categories: ${error.message}`),
      );
    });
  });
};

export const updateCategory = async (id: number, newName: string) => {
  if (!db) {
    console.error('Database not opened');
    return;
  }

  db.transaction(tx => {
    tx.executeSql(
      `UPDATE categories SET name = ? WHERE id = ?`,
      [newName, id],
      () => console.log('Category updated successfully'),
      error => console.error('Error updating category: ', error),
    );
  });
};

export const deleteCategory = async (id: number) => {
  if (!db) {
    console.error('Database not opened');
    return;
  }

  db.transaction(tx => {
    tx.executeSql(
      `DELETE FROM categories WHERE id = ?`,
      [id],
      () => console.log('Category deleted successfully'),
      error => console.error('Error deleting category: ', error),
    );
  });
};
