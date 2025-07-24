import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Index from './index';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Shop from './Shop';
import type { RootStackParamList } from './Game'; 

import { UserProvider } from '@/context/UserContext';
import Game from './Game';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <UserProvider>
      <Stack.Navigator initialRouteName="Index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Index" component={Index} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Shop" component={Shop} />
        <Stack.Screen name="Game" component={Game} />
      </Stack.Navigator>
    </UserProvider>
  );
}

