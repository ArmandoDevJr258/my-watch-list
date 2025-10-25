import { Tabs } from 'expo-router';
import {Image} from 'expo-image'
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { WatchlistProvider } from "../context/WatchlistContext";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (

     <WatchlistProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => 
            <Image source={require('../../assets/images/home3.png')}
            style={{width:30,height:30,tintColor:'white'}}/>,
        }}
      />
      <Tabs.Screen
        name="mywatchlist"
        options={{
          title: 'My Watch List',
          tabBarIcon: ({ color }) => 
             <Image source={require('../../assets/images/clapperboard5.png')}
            style={{width:25,height:25,tintColor:'white'}}/>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => 
          <Image source={require('../../assets/images/setting.png')}
            style={{width:25,height:25,tintColor:'white'}}/>,
        }}
      />
    </Tabs></WatchlistProvider>
  );
}
