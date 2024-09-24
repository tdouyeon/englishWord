import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  TextInput,
  Pressable,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  deleteWord,
  getWordsByCategoryName,
  updateWord,
} from '../database/queries/wordQueries';
import {WordData} from '../database/models/wordModel';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';
import {Checkbox} from 'react-native-paper';
import {SwipeListView} from 'react-native-swipe-list-view';
import SoundPlayer from 'react-native-sound-player';
import RNFS from 'react-native-fs';

type WordListRouteProp = RouteProp<RootStackParamList, 'WordList'>;

const options = ['사진', '단어', '의미', '발음'];

// 권한 요청 함수
const requestStoragePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: '저장소 접근 권한',
        message: '앱이 저장소에 접근할 수 있도록 허용해 주세요.',
        buttonNeutral: '나중에',
        buttonNegative: '취소',
        buttonPositive: '허용',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};
const WordListScreen = () => {
  const route = useRoute<WordListRouteProp>();
  const {category} = route.params;
  const [wordList, setWordList] = useState<WordData[]>();
  const [showList, setShowList] = useState(options);
  const [editId, setEditId] = useState('');

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

  const updateRow = async (id: string, key: string, text: string) => {
    const newWordList = wordList?.map(word => {
      if (word.id == id) {
        return {...word, [key]: text};
      } else {
        return word;
      }
    }) as WordData[]; // 타입 캐스팅
    setWordList(newWordList);
  };

  const deleteRow = async (word: string) => {
    Alert.alert(
      '확인',
      '이 작업을 계속 하시겠습니까?',
      [
        {
          text: '취소',
          onPress: () => console.log('취소됨'),
          style: 'cancel', // iOS에서는 '취소' 스타일을 지정
        },
        {
          text: '확인',
          onPress: async () => {
            await deleteWord(word);
            await getCategoryWords();
          },
        },
      ],
      {cancelable: false}, // 사용자가 경고창 밖을 터치해도 닫히지 않도록 설정
    );
  };

  const handlePressPronunciation = async (text: string) => {
    try {
      // http://localhost:3000/synthesize
      // http://192.168.35.151:3000/synthesize
      const response = await fetch('http://192.168.35.151:3000/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({text}),
      });

      if (response.ok) {
        const blob = await response.blob();
        console.log(blob, 'blob예요');
        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64data = reader.result as string; // base64 데이터

          // 로컬 경로 설정
          const path = `${RNFS.DocumentDirectoryPath}/audio.mp3`;

          // 권한 확인 및 요청
          const hasPermission = await requestStoragePermission();
          if (!hasPermission && Platform.OS == 'android') {
            Alert.alert(
              '권한이 필요합니다',
              '저장소 접근 권한을 허용해 주세요.',
            );
            return;
          }

          // base64 데이터를 파일로 저장
          await RNFS.writeFile(path, base64data, 'base64');
          console.log('파일이 성공적으로 저장되었습니다:', path);
          const fileExists = await RNFS.exists(path);
          console.log('파일 존재 여부:', fileExists);

          // 저장된 파일 경로로 음성 재생
          try {
            SoundPlayer.playUrl(`file://${path}`);
            console.log(`실제 플레이 요청 경로: file://${path}`);
          } catch (error) {
            console.error('Audio playback error:', error);
          }
        };

        reader.readAsDataURL(blob); // Blob 데이터를 base64로 변환
      } else {
        console.error('Failed to fetch audio:', response.statusText);
      }
    } catch (error) {
      console.error('Error during speech synthesis:', error);
    }
  };

  const renderItem = ({item}: {item: WordData}) => (
    <TouchableOpacity
      style={styles.wordContainer}
      onPress={() => setDropdownVisible(false)}
      activeOpacity={1}>
      <View style={styles.wordImage}>
        {item.imageUri && showList.includes('사진') && (
          <Image source={{uri: item.imageUri}} style={styles.wordImage} />
        )}
      </View>
      <View style={styles.wordDetails}>
        <TextInput
          style={styles.input}
          value={showList.includes('단어') ? item.word : ''}
          editable={editId === item.id}
          multiline
          numberOfLines={100}
          onChangeText={text => {
            updateRow(item.id, 'word', text);
          }}
        />
        <TextInput
          style={styles.input}
          value={showList.includes('의미') ? item.meaning : ''}
          editable={editId === item.id}
          multiline
          numberOfLines={100}
          onChangeText={text => {
            updateRow(item.id, 'meaning', text);
          }}
        />
        <TouchableOpacity onPress={() => handlePressPronunciation(item.word)}>
          {item?.pronunciation ? (
            <TextInput
              style={styles.input}
              value={showList.includes('발음') ? item.pronunciation : ''}
              editable={editId === item.id}
              multiline
              numberOfLines={100}
              onChangeText={text => {
                updateRow(item.id, 'pronunciation', text);
              }}
            />
          ) : (
            <Image
              source={require('../../assets/images/volume.png')} // 이미지 경로를 설정
              style={styles.volumnImage}
            />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setDropdownVisible(false)}
      activeOpacity={1}>
      <Pressable
        style={styles.dropdown}
        onPress={() => setDropdownVisible(!dropdownVisible)}>
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

          <View style={styles.selectedOptionContainer}>
            <View style={{display: 'flex', flexDirection: 'row', flex: 1}}>
              {showList.map((option, index) => (
                <View style={styles.selectedOptionView} key={index}>
                  <Text>{option}</Text>
                </View>
              ))}
              {editId && (
                <TouchableOpacity
                  style={styles.editComplate}
                  onPress={async () => {
                    const editWord = wordList?.find(
                      word => word.id === editId,
                    ) as WordData;
                    await updateWord(editWord);
                    setEditId('');
                  }}>
                  <Text>완료</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
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
                initialNumToRender={10} // 첫 렌더링 시 최대 10개의 항목만 렌더링
                maxToRenderPerBatch={10} // 배치 당 최대 10개의 항목을 렌더링
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
      </Pressable>
      <View style={styles.graphHeader}>
        <Text style={styles.graphHeaderText}>사진</Text>
        <Text style={styles.graphHeaderText}>단어</Text>
        <Text style={styles.graphHeaderText}>뜻</Text>
        <Text style={styles.graphHeaderText}>발음</Text>
      </View>

      <SwipeListView
        data={wordList}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        disableRightSwipe={false}
        contentContainerStyle={styles.listContent}
        renderHiddenItem={(data, rowMap) => (
          <View style={styles.rowBack}>
            <TouchableOpacity
              style={styles.backLeftBtn}
              onPress={() => {
                {
                  setEditId(data.item.id);
                  rowMap[data.item.id].closeRow();
                }
              }}>
              <Text style={styles.backText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.backRightBtn, styles.backRightBtnRight]}
              onPress={() => deleteRow(data.item.word)}>
              <Text style={styles.backTextWhite}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
        rightOpenValue={-120}
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
  volumnImage: {
    marginHorizontal: 40,
    width: 20,
    height: 20,
    opacity: 0.7,
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
  input: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    width: 90,
    textAlign: 'center',
  },
  dropdown: {
    position: 'relative',
    zIndex: 999,
    marginLeft: 10,
  },
  selectedOptionContainer: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  selectedOptionView: {
    backgroundColor: '#F1F3F5',
    padding: 10,
    marginHorizontal: 2,
    borderRadius: 5,
  },
  editComplate: {
    position: 'absolute',
    right: 10,
    backgroundColor: '#FCC9AA',
    padding: 10,
    marginHorizontal: 2,
    borderRadius: 20,
  },
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
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: 15,
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
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 60,
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

export default WordListScreen;
