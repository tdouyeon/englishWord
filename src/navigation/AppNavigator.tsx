import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import AddWordScreen from '../screens/AddWordScreen';
import WordListScreen from '../screens/WordListScreen';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from './types';
import {dbOpen} from '../database/db';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';

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
        initialRouteName="WordList"
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
        })}>
        <Stack.Screen
          name="WordList"
          component={WordListScreen}
          options={{title: '단어 리스트'}}
        />
        <Stack.Screen
          name="AddWord"
          component={AddWordScreen}
          options={{title: '단어 추가'}}
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
});

export default AppNavigator;
