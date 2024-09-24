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
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Linking,
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
      navigation.navigate('CategoryList');
    } else {
      Alert.alert('안내사항', '단어, 의미, 카테고리는 필수입니다.');
    }
  };

  const onPressNaverButton = async (word: string) => {
    const url = `https://endic.naver.com/search.nhn?sLn=ko&searchOption=all&query=${encodeURIComponent(
      word,
    )}`;
    Linking.openURL(url);
  };

  const onAddCategory = async (categoryName: string) => {
    await addCategory(Date.now().toString(), categoryName);
    await getCategories();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS == 'ios' ? 70 : 0}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.topView}>
          <Pressable onPress={selectImage} style={styles.image}>
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
          <TouchableOpacity
            onPress={() => {
              onPressNaverButton(word);
            }}>
            <Image
              source={require('../../assets/images/naver.png')}
              style={styles.naverImg}
            />
            <Text>사전</Text>
          </TouchableOpacity>
        </View>
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
          placeholderTextColor="#ccc"
          value={word}
          onChangeText={setWord}
          style={styles.input}
        />
        <TextInput
          placeholder="뜻"
          placeholderTextColor="#ccc"
          value={meaning}
          onChangeText={setMeaning}
          style={styles.input}
        />
        <TextInput
          placeholder="발음"
          placeholderTextColor="#ccc"
          value={pronunciation}
          onChangeText={setPronunciation}
          style={styles.input}
        />
      </ScrollView>
      <View style={styles.saveButtonContainer}>
        <Pressable onPress={addWord} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>저장</Text>
        </Pressable>
      </View>
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
      {visible && (
        <CategoryModal
          visible={visible}
          onClose={() => setVisible(false)}
          onAddCategory={(categoryName: string) => {
            onAddCategory(categoryName);
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    flex: 1,
  },
  topView: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    borderColor: '#ccc',
    borderBottomWidth: 1,
    marginVertical: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    color: 'black',
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
  naverImg: {width: 30, height: 30, marginBottom: 5},
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
  saveButtonContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  saveButton: {
    backgroundColor: '#FFC0CB',
    paddingHorizontal: 10,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 30,
  },
  saveButtonText: {fontSize: 18},
});

export default AddWordScreen;
