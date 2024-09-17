import React, {useState} from 'react';
import {View, TextInput, Image, Pressable, Text} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useTypedNavigation} from '../navigation/hooks';
import {
  launchImageLibrary,
  ImagePickerResponse,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import {insertWord} from '../database/queries/wordQueries';

const AddWordScreen = () => {
  const navigation = useTypedNavigation();
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [category, setCategory] = useState('단어1');
  const [categoryList, setCategoryList] = useState([]);
  const [imageUri, setImageUri] = useState<string | null>(null);

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
      <Pressable>
        <Text>카테고리 추가</Text>
      </Pressable>
      {categoryList.length > 0 && (
        <Picker
          selectedValue={category}
          onValueChange={itemValue => setCategory(itemValue)}
          style={{borderBottomWidth: 1, marginBottom: 10}}>
          {categoryList?.map(category => (
            <Picker.Item label={category} value={category} />
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
