import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from './types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const useTypedNavigation = () => useNavigation<NavigationProp>();
