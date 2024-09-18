import React, {useEffect, useState} from 'react';
import {View, TextInput, Image, Pressable, Text, Alert} from 'react-native';
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
  const [visible, setVisible] = useState(false);

  const getCategories = async () => {
    const categories = await getAllCategories();
    setCategoryList(categories);
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
    if (isNotEmpty([word, meaning, category])) {
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
    <View style={{padding: 20}}>
      <TextInput
        placeholder="단어 (영어)"
        value={word}
        onChangeText={setWord}
        style={{borderBottomWidth: 1, marginBottom: 10}}
      />
      <TextInput
        placeholder="뜻"
        value={meaning}
        onChangeText={setMeaning}
        style={{borderBottomWidth: 1, marginBottom: 10}}
      />
      <TextInput
        placeholder="발음"
        value={pronunciation}
        onChangeText={setPronunciation}
        style={{borderBottomWidth: 1, marginBottom: 10}}
      />
      <Pressable onPress={() => setVisible(true)}>
        <Text>카테고리 추가</Text>
      </Pressable>
      {visible && (
        <CategoryModal
          visible={visible}
          onClose={() => setVisible(false)}
          onAddCategory={(categoryName: string) => {
            onAddCategory(categoryName);
          }}
        />
      )}
      {categoryList.length > 0 && (
        <Picker
          selectedValue={category}
          onValueChange={itemValue => setCategory(itemValue)}
          style={{borderBottomWidth: 1, marginBottom: 10}}>
          {categoryList?.map(category => (
            <Picker.Item
              label={category.name}
              value={category.name}
              key={category.id}
            />
          ))}
        </Picker>
      )}
      <Pressable onPress={selectImage}>
        <Text>사진 선택</Text>
      </Pressable>
      {imageUri && (
        <Image
          source={{uri: imageUri}}
          style={{width: 100, height: 100, marginVertical: 10}}
        />
      )}
      <Pressable onPress={addWord}>
        <Text>단어 추가</Text>
      </Pressable>
    </View>
  );
};

export default AddWordScreen;
