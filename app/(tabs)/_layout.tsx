import { Tabs } from 'expo-router';
import { Image } from 'expo-image';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { FavoritesProvider } from '../context/FavoritesContext';
import { WatchlistProvider } from "../context/WatchlistContext";
import { SettingsProvider } from '../context/SettingsContext';

export default function TabLayout() {
  return (
    <SettingsProvider>
      <FavoritesProvider>
        <WatchlistProvider>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: 'black', // black bottom tab background
                borderTopColor: '#000',    // removes gray line
                height: 60,
              },
              tabBarButton: HapticTab,
            }}
          >
            {/* Home Tab */}
            <Tabs.Screen
              name="index"
              options={{
                title: 'Home',
                tabBarIcon: ({ focused }) => (
                  <Image
                    source={
                      focused
                        ? require('../../assets/images/home1.png')
                        : require('../../assets/images/home.png')
                    }
                    style={{ width: 30, height: 30,tintColor:'white' }}
                  />
                ),
              }}
            />

            {/* Watchlist Tab */}
            <Tabs.Screen
              name="mywatchlist"
              options={{
                title: 'My Watch List',
                tabBarIcon: ({ focused }) => (
                  <Image
                    source={
                      focused
                        ? require('../../assets/images/clapperboard.png')
                        : require('../../assets/images/clapperboard4.png')
                    }
                    style={{ width: 25, height: 25,tintColor:'white' }}
                  />
                ),
              }}
            />

            {/* Settings Tab */}
            <Tabs.Screen
              name="settings"
              options={{
                title: 'Settings',
                tabBarIcon: ({ focused }) => (
                  <Image
                    source={
                      focused
                        ? require('../../assets/images/setting2.png')
                        : require('../../assets/images/setting3.png')
                    }
                    style={{ width: 25, height: 25,tintColor:'white' }}
                  />
                ),
              }}
            />
          </Tabs>
        </WatchlistProvider>
      </FavoritesProvider>
    </SettingsProvider>
  );
}
