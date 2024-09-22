import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {
  deleteCategory,
  getAllCategories,
  updateCategory,
} from '../database/queries/categoryQueries';
import {CategoryData} from '../database/models/categoryModel';
import {getCategoryWordCount} from '../database/queries/wordQueries';
import {useTypedNavigation} from '../navigation/hooks';
import {useFocusEffect} from '@react-navigation/native';
import {SwipeListView} from 'react-native-swipe-list-view';

type categories = {id: string; name: string; count: number};

const CategoryListScreen = () => {
  const [categories, setCategories] = useState<categories[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState('');
  const navigation = useTypedNavigation();

  const onClickCategory = async (category: string) => {
    navigation.navigate('WordList', {category});
  };
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
        categories.map(async ({id, name}: CategoryData) => {
          try {
            const count = await getCategoryWordCount(name);
            return {id, name, count};
          } catch (error) {
            console.error('Error fetching category count:', error);
            return {id: '', name: '', count: 0};
          }
        }),
      );
      setCategories(categoriesCount);
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 뒤로가기로 Foucs돼도 인지 가능하도록 useFocusEffect 사용
  useFocusEffect(
    React.useCallback(() => {
      fetchCategories();
    }, []),
  );

  const updateRow = (newCategory: string) => {
    const newCategories = categories?.map(category => {
      if (category.id == editId) {
        return {...category, name: newCategory};
      } else {
        return category;
      }
    });
    setCategories(newCategories);
  };

  const deleteRow = async (id: string) => {
    Alert.alert(
      '확인',
      '이 작업을 계속 하시겠습니까?',
      [
        {text: '취소', onPress: () => console.log('취소됨'), style: 'cancel'},
        {
          text: '확인',
          onPress: async () => {
            await deleteCategory(id);
            await fetchCategories();
          },
        },
      ],
      {cancelable: false},
    );
  };

  const renderItem = ({item}: {item: categories}) => (
    <TouchableOpacity
      onPress={() => {
        if (editId) {
          return null;
        } else {
          onClickCategory(item.name);
        }
      }}
      style={styles.itemContainer}
      activeOpacity={1}>
      <View style={styles.inputView}>
        <TextInput
          value={item.name}
          editable={editId === item.id}
          multiline
          numberOfLines={100}
          style={styles.itemInput}
          underlineColorAndroid="transparent"
          onChangeText={updateRow}
        />
      </View>
      <Text style={styles.itemCountText}>({item.count})</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {editId && (
        <View style={styles.editComplateContainer}>
          <TouchableOpacity
            style={styles.editComplate}
            onPress={async () => {
              const editCategory = categories?.find(
                category => category.id === editId,
              );
              if ((editCategory?.id, editCategory?.name)) {
                await updateCategory(editCategory?.id, editCategory?.name);
                setEditId('');
              }
            }}>
            <Text>완료</Text>
          </TouchableOpacity>
        </View>
      )}
      <SwipeListView
        data={categories}
        keyExtractor={item => item.name}
        disableRightSwipe={false}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        renderHiddenItem={(data, rowMap) => (
          <View style={styles.rowBack}>
            <TouchableOpacity
              style={styles.backLeftBtn}
              onPress={() => {
                {
                  setEditId(data.item.id);
                  rowMap[data.item.name].closeRow();
                }
              }}>
              <Text style={styles.backText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.backRightBtn, styles.backRightBtnRight]}
              onPress={() => deleteRow(data.item.id)}>
              <Text style={styles.backTextWhite}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
        rightOpenValue={-120}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  itemContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#E1E1E1',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    height: 70,
  },
  editComplateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editComplate: {
    backgroundColor: '#FCC9AA',
    padding: 10,
    marginHorizontal: 2,
    borderRadius: 20,
    width: 45,
  },
  inputView: {},
  itemInput: {
    color: '#343A40',
    fontSize: 18,
    backgroundColor: 'white',
    padding: 10,
  },
  listContent: {
    paddingHorizontal: 1,
  },
  itemCountText: {color: '#A1A1A1'},
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: 15,
    height: 70,
  },
  backLeftBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    right: 60,
    width: 60,
    backgroundColor: '#E1E1E1',
    height: '100%',
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 60,
    height: '100%',
  },
  backRightBtnRight: {
    backgroundColor: 'red',
    right: 0,
  },
  backTextWhite: {
    color: '#FFF',
  },
  backText: {
    color: 'black',
  },
});

export default CategoryListScreen;
