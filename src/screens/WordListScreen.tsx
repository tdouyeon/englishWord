import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import {getWordsByCategoryName} from '../database/queries/wordQueries';
import {WordData} from '../database/models/wordModel';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';
import {Checkbox} from 'react-native-paper';
type WordListRouteProp = RouteProp<RootStackParamList, 'WordList'>;

const options = ['사진', '단어', '의미', '발음'];

const WordListScreen = () => {
  const route = useRoute<WordListRouteProp>();
  const {category} = route.params;
  const [wordList, setWordList] = useState<WordData[]>();
  const [showList, setShowList] = useState(['사진', '단어', '의미']);

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const getCategoryWords = async () => {
    const words = await getWordsByCategoryName(category);
    setWordList(words);
  };

  useEffect(() => {
    getCategoryWords();
  }, []);

  const handleOptionPress = (option: string) => {
    if (showList.includes(option)) {
      setShowList(showList.filter(item => item !== option));
    } else {
      setShowList([...showList, option]);
    }
  };

  const handleSelectAll = () => {
    if (showList.length === options.length) {
      setShowList([]);
    } else {
      setShowList(options);
    }
  };

  const renderItem = ({item}: {item: WordData}) => (
    <View style={styles.wordContainer}>
      <View style={styles.wordImage}>
        {item.imageUri && showList.includes('사진') && (
          <Image source={{uri: item.imageUri}} style={styles.wordImage} />
        )}
      </View>
      <View style={styles.wordDetails}>
        <Text style={styles.wordText}>
          {showList.includes('단어') && `${item.word}`}
        </Text>
        <Text style={styles.wordText}>
          {showList.includes('의미') && `${item.meaning}`}
        </Text>
        <Text style={styles.wordText}>
          {showList.includes('발음') && `[${item.pronunciation}]`}
        </Text>
      </View>
    </View>
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setDropdownVisible(false)}
      activeOpacity={1}>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setDropdownVisible(!dropdownVisible)}
        activeOpacity={1}>
        <View style={styles.optionChoose}>
          <View style={styles.optionView}>
            <Text style={styles.optionChooseText}>필터</Text>
            <Image
              source={require('../../assets/images/leftArrow.png')}
              style={[
                styles.arrowIcon,
                {transform: [{rotate: dropdownVisible ? '90deg' : '270deg'}]},
              ]}
            />
          </View>

          <TouchableWithoutFeedback style={styles.selectedOptionContainer}>
            <View style={{display: 'flex', flexDirection: 'row'}}>
              {showList.map(option => (
                <View style={styles.selectedOptionView}>
                  <Text style={styles.selectedOption}>{option}</Text>
                </View>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>

        {dropdownVisible && (
          <TouchableWithoutFeedback>
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={handleSelectAll}>
                <Checkbox
                  status={
                    showList.length === options.length ? 'checked' : 'unchecked'
                  }
                  onPress={handleSelectAll}
                />
                <Text style={styles.optionText}>전체 선택</Text>
              </TouchableOpacity>
              <FlatList
                data={options}
                keyExtractor={item => item}
                renderItem={({item}) => (
                  <TouchableOpacity onPress={() => handleOptionPress(item)}>
                    <View
                      style={[
                        styles.optionRow,
                        {
                          backgroundColor: showList.includes(item)
                            ? '#F1F3F5'
                            : 'white',
                        },
                      ]}>
                      <Checkbox
                        status={
                          showList.includes(item) ? 'checked' : 'unchecked'
                        }
                        onPress={() => handleOptionPress(item)}
                      />
                      <Text style={styles.optionText}>{item}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableWithoutFeedback>
        )}
      </TouchableOpacity>
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
    </TouchableOpacity>
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
    position: 'relative',
    zIndex: 1,
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
  dropdown: {
    position: 'relative',
    zIndex: 999,
    marginLeft: 10,
  },
  selectedOptionContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  selectedOptionView: {
    backgroundColor: '#F1F3F5',
    padding: 10,
    marginHorizontal: 2,
    borderRadius: 5,
  },
  selectedOption: {},
  optionChoose: {
    paddingVertical: 10,
    display: 'flex',
    flexDirection: 'row',
  },
  optionView: {width: 70},
  optionChooseText: {
    textAlign: 'center',
    lineHeight: 30,
    paddingRight: 10,
  },
  dropdownMenu: {
    position: 'absolute',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: 130,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    marginHorizontal: 5,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
  },
  arrowIcon: {
    width: 10,
    height: 10,
    tintColor: 'black',
    position: 'absolute',
    top: 12,
    right: 10,
  },
});

export default WordListScreen;
