import React, {useEffect, useState} from 'react';
import {
  View,
  TextInput,
  Image,
  Pressable,
  Text,
  Alert,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useTypedNavigation} from '../navigation/hooks';
import {
  launchImageLibrary,
  ImagePickerResponse,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import {insertWord} from '../database/queries/wordQueries';
import {
  addCategory,
  getAllCategories,
} from '../database/queries/categoryQueries';
import CategoryModal from '../components/CategoryModal';
import {isNotEmpty} from '../utils/utils';
import {CategoryData} from '../database/models/categoryModel';

const AddWordScreen = () => {
  const navigation = useTypedNavigation();
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [category, setCategory] = useState('');
  const [categoryList, setCategoryList] = useState<CategoryData[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isCategoryListVisible, setIsCategoryListVisible] = useState(false);
  const [visible, setVisible] = useState(false);

  const getCategories = async () => {
    const categories = await getAllCategories();
    setCategoryList(categories);
    if (categories.length > 0) {
      setCategory(categories[0].name);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const selectImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0]?.uri;
        if (uri) {
          setImageUri(uri);
        }
      }
    });
  };

  const addWord = () => {
    if (!isNotEmpty([word, meaning, category])) {
      const newWord = {
        id: Date.now().toString(),
        word,
        meaning,
        pronunciation,
        category,
        imageUri,
      };
      insertWord(newWord);
      navigation.navigate('WordList');
    } else {
      Alert.alert('안내사항', '단어, 의미, 카테고리는 필수입니다.');
    }
  };

  const onAddCategory = async (categoryName: string) => {
    await addCategory(categoryName);
    await getCategories();
  };

  return (
    <View style={styles.container}>
      <View>
        <Pressable onPress={selectImage}>
          {!imageUri ? (
            <View style={styles.imageContainer}>
              <Image
                source={require('../../assets/images/plus.png')}
                style={styles.plusImage}
                alt="사진 선택"
              />
            </View>
          ) : (
            <Image source={{uri: imageUri}} style={styles.image} />
          )}
        </Pressable>
        <View style={styles.categoryContainer}>
          <TouchableOpacity
            onPress={() => {
              setIsCategoryListVisible(true);
            }}>
            <View style={styles.input}>
              <Text style={styles.categoryText}>
                {category || '카테고리 없음'}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setVisible(true)}
            style={styles.categoryAddButton}>
            <Image
              source={require('../../assets/images/plus.png')}
              alt="플러스"
              style={styles.plusImage2}
            />
          </TouchableOpacity>
        </View>
        <TextInput
          placeholder="단어 (영어)"
          value={word}
          onChangeText={setWord}
          style={styles.input}
        />
        <TextInput
          placeholder="뜻"
          value={meaning}
          onChangeText={setMeaning}
          style={styles.input}
        />
        <TextInput
          placeholder="발음"
          value={pronunciation}
          onChangeText={setPronunciation}
          style={styles.input}
        />
        {visible && (
          <CategoryModal
            visible={visible}
            onClose={() => setVisible(false)}
            onAddCategory={(categoryName: string) => {
              onAddCategory(categoryName);
            }}
          />
        )}
      </View>
      <Pressable onPress={addWord} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>저장</Text>
      </Pressable>
      {categoryList.length > 0 && isCategoryListVisible && (
        <Modal
          visible={isCategoryListVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setIsCategoryListVisible(false);
          }}>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => {
              setIsCategoryListVisible(false);
            }}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <View>
                  <Text style={styles.modalTitle}>카테고리 선택</Text>
                </View>
                <Picker
                  selectedValue={category}
                  onValueChange={setCategory}
                  style={styles.picker}>
                  {categoryList.map(category => (
                    <Picker.Item
                      label={category.name}
                      value={category.name}
                      key={category.id}
                    />
                  ))}
                </Picker>
                <TouchableOpacity
                  onPress={() => {
                    setIsCategoryListVisible(false);
                  }}
                  style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>닫기</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'space-between',
  },
  input: {
    borderColor: '#ccc',
    borderBottomWidth: 1,
    marginVertical: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    color: '#343A40',
    fontSize: 16,
  },
  categoryText: {
    fontSize: 16,
    color: '#FFC0CB',
    fontWeight: '500',
  },
  subText: {fontSize: 16, marginTop: 10, marginBottom: 5},
  imageContainer: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#bbb',
    marginBottom: 5,
  },
  plusImage: {width: 40, height: 40, opacity: 0.5},
  plusImage2: {
    width: 25,
    height: 25,
  },
  image: {
    width: 130,
    height: 130,
    marginVertical: 10,
    borderRadius: 5,
  },
  categoryContainer: {position: 'relative'},
  categoryAddButton: {
    position: 'absolute',
    right: 10,
    top: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  picker: {
    width: '100%',
  },
  closeButton: {
    backgroundColor: '#FFC0CB',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: '#FFC0CB',
    paddingHorizontal: 10,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  saveButtonText: {fontSize: 18},
});

export default AddWordScreen;
