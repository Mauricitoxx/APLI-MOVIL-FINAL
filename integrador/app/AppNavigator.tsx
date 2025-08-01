import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Index from './index';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Shop from './Shop';
import { UserProvider } from '@/context/UserContext';
import User from './User';
import Game from './Game';
import LevelsScreen from './Levels';
import GameScreen from './GameScreen';
import { RootStackParamList } from '@/types/navigation';

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
        <Stack.Screen name="User" component={User} />
        <Stack.Screen name="Game" component={Game} />
        <Stack.Screen name="Levels" component={LevelsScreen} />
        
        <Stack.Screen name="GameScreen" component={GameScreen} />
      </Stack.Navigator>
    </UserProvider>
  );
}

