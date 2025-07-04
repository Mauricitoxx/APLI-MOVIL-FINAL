import React, { ReactNode } from 'react';
import { View } from 'react-native';
import Index from './index';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <View style={{ flex: 1 }}>
      <Index />
    </View>
  );
}