import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import AddWordScreen from '../screens/AddWordScreen';
import WordListScreen from '../screens/WordListScreen';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from './types';
import {dbOpen} from '../database/db';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import CategoryListScreen from '../screens/CategoryListScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const initializeDb = async () => {
      try {
        await dbOpen();
        setIsDbReady(true);
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };
    initializeDb();
  }, []);

  if (!isDbReady) {
    return (
      <View>
        <Text>Loading DB...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="CategoryList"
        screenOptions={({navigation}) => ({
          headerTintColor: 'black',
          headerTitleStyle: {fontWeight: 'bold'},
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerButton}>
              <Image
                source={require('../../assets/images/leftArrow.png')}
                style={styles.headerIcon}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('AddWord')}
              style={styles.headerPlusIcon}>
              <Image
                source={require('../../assets/images/plus.png')}
                style={styles.plusImage}
                alt="단어 추가"
              />
            </TouchableOpacity>
          ),
        })}>
        <Stack.Screen
          name="CategoryList"
          component={CategoryListScreen}
          options={{title: '카테고리별 리스트', headerLeft: () => null}}
        />
        <Stack.Screen
          name="WordList"
          component={WordListScreen}
          options={{title: '단어 리스트', headerRight: () => null}}
        />
        <Stack.Screen
          name="AddWord"
          component={AddWordScreen}
          options={{title: '단어 추가', headerRight: () => null}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    marginLeft: 15,
  },
  headerIcon: {
    width: 15,
    height: 15,
    tintColor: 'black',
  },
  headerPlusIcon: {
    flex: 1,
    justifyContent: 'center', // 수직 중앙 정렬
    alignItems: 'center',
  },
  plusImage: {
    position: 'absolute',
    width: 30,
    height: 30,
    right: 10,
  },
});

export default AppNavigator;
