import React, {useEffect, useState} from 'react';
import {View, Text, Image, FlatList, Pressable} from 'react-native';
import {getAllWords} from '../database/queries/wordQueries';
import {WordData} from '../database/models/wordModel';
import {getAllCategories} from '../database/queries/categoryQueries';
import {useTypedNavigation} from '../navigation/hooks';

const WordListScreen = () => {
  const navigation = useTypedNavigation();
  const [wordList, setWordList] = useState<WordData[]>();

  const getCategories = async () => {
    const categories = await getAllCategories();
    console.log(categories, '카테고리 와랏!');
  };

  const getWords = async () => {
    const words = await getAllWords();
    setWordList(words);
    return;
  };

  useEffect(() => {
    getCategories();
    getWords();
  }, []);
  // const render = () => (
  //   <View style={{padding: 20, borderBottomWidth: 1}}>
  //     {item.imageUri && (
  //       <Image source={{uri: item.imageUri}} style={{width: 50, height: 50}} />
  //     )}
  //     <Text>단어: {item.word}</Text>
  //     <Text>뜻: {item.meaning}</Text>
  //     <Text>발음: {item.pronunciation}</Text>
  //     <Text>카테고리: {item.category}</Text>
  //   </View>
  // );

  return (
    <View>
      <Pressable
        onPress={() => {
          navigation.navigate('AddWord');
        }}>
        <Text>단어 추가</Text>
      </Pressable>
      <Text>리스트페이지</Text>
    </View>

    // <FlatList
    //   data={wordList}
    //   keyExtractor={item => item.id}
    //   renderItem={renderItem}
    // />
  );
};

export default WordListScreen;
