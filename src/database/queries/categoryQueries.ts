import {getDatabase} from '../db';
import {CategoryData} from '../models/categoryModel';

const db = getDatabase();

export const addCategory = async (id: string, name: string) => {
  if (!db) {
    console.error('Database not opened');
    return;
  }

  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO categories (id, name) VALUES (?, ?)`,
      [id, name],
      () => console.log('Category added successfully'),
      error => console.error('Error adding category: ', error),
    );
  });
};

export const getAllCategories = async (): Promise<CategoryData[]> => {
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

export const updateCategory = async (id: string, newName: string) => {
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

export const deleteCategory = async (id: string) => {
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
