import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Index from './index';
import Login from './Login';
import Register from './Register';

const Stack = createNativeStackNavigator();

export default function App() {
  return (

      <Stack.Navigator initialRouteName="Index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Index" component={Index} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
      </Stack.Navigator>
    
  );
}

