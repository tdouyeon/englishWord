import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import {MD3LightTheme as DefaultTheme, PaperProvider} from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FFC0CB',
    secondary: '#F1F3F5',
  },
};

function App(): React.JSX.Element {
  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
    </PaperProvider>
  );
}

export default App;
