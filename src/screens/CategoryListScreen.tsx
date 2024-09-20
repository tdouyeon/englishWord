import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {getAllCategories} from '../database/queries/categoryQueries';
import {CategoryData} from '../database/models/categoryModel';
import {getCategoryWordCount} from '../database/queries/wordQueries';
import {useTypedNavigation} from '../navigation/hooks';

const CategoryListScreen = () => {
  const [categories, setCategories] = useState<{name: string; count: number}[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const navigation = useTypedNavigation();

  const onClickCategory = async (category: string) => {
    navigation.navigate('WordList', {category});
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        fetchCategoryCount(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategoryCount = async (categories: CategoryData[]) => {
      try {
        const categoriesCount = await Promise.all(
          categories.map(async ({name}: CategoryData) => {
            try {
              const count = await getCategoryWordCount(name);
              return {name, count};
            } catch (error) {
              console.error('Error fetching category count:', error);
              return {name, count: 0};
            }
          }),
        );
        setCategories(categoriesCount);
      } catch (error) {
        console.error('Error fetching category counts:', error);
      }
    };

    fetchCategories();
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={item => item.name}
        renderItem={({item}: {item: {name: string; count: number}}) => (
          <TouchableOpacity
            onPress={() => {
              onClickCategory(item.name);
            }}
            style={styles.itemContainer}>
            <Text style={styles.itemText}>
              {item.name}{' '}
              <Text style={styles.itemCountText}>({item.count})</Text>
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#E1E1E1',
  },
  itemText: {
    fontSize: 18,
  },
  itemCountText: {color: '#A1A1A1'},
});

export default CategoryListScreen;
