import React, {useEffect, useState} from 'react';
import {View, Text, Image, FlatList, StyleSheet} from 'react-native';
import {getWordsByCategoryName} from '../database/queries/wordQueries';
import {WordData} from '../database/models/wordModel';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';

type WordListRouteProp = RouteProp<RootStackParamList, 'WordList'>;

const WordListScreen = () => {
  const route = useRoute<WordListRouteProp>();
  const {category} = route.params;

  const [wordList, setWordList] = useState<WordData[]>();

  const getCategoryWords = async () => {
    const words = await getWordsByCategoryName(category);
    setWordList(words);
  };

  useEffect(() => {
    getCategoryWords();
  }, []);

  const renderItem = ({item}: {item: WordData}) => (
    <View style={styles.wordContainer}>
      <View style={styles.wordImage}>
        {item.imageUri && (
          <Image source={{uri: item.imageUri}} style={styles.wordImage} />
        )}
      </View>
      <View style={styles.wordDetails}>
        <Text style={styles.wordText}>{item.word}</Text>
        <Text style={styles.wordText}>{item.meaning}</Text>
        <Text style={styles.wordText}>[{item.pronunciation}]</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.graphHeader}>
        <Text style={styles.graphHeaderText}>사진</Text>
        <Text style={styles.graphHeaderText}>단어</Text>
        <Text style={styles.graphHeaderText}>뜻</Text>
        <Text style={styles.graphHeaderText}>발음</Text>
      </View>
      <FlatList
        data={wordList}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  graphHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 0.7,
    borderColor: '#E1E1E1',
  },
  graphHeaderText: {
    fontSize: 15,
    color: '#A4A4A4',
    width: 90,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 1,
  },
  wordContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderBottomWidth: 1,
    borderColor: '#E1E1E1',
    paddingVertical: 12,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  wordImage: {
    width: 70,
    height: 70,
    marginLeft: 5,
    marginRight: 20,
    borderRadius: 5,
  },
  wordDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  wordText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    width: 90,
  },
});

export default WordListScreen;
