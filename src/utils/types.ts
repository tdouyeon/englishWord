export type WordData = {
  id: string;
  word: string;
  meaning: string;
  pronunciation: string;
  category: string;
  imageUri: string | null;
};

export type CategoryData = {
  id: string;
  name: string;
};
