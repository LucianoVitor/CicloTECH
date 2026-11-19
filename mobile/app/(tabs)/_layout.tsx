import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, glow } from '@/theme/colors';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Ícone da aba com o traço azul neon acima quando ativa (como no protótipo mobile). */
function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          position: 'absolute',
          top: -10,
          width: 28,
          height: 3,
          borderRadius: 2,
          backgroundColor: focused ? colors.primary : 'transparent',
          boxShadow: focused ? glow.strong : undefined,
        }}
      />
      <Ionicons name={name} size={22} color={focused ? colors.primary : colors.tabInactive} />
    </View>
  );
}

export default function TabsLayout() {
  // Altura própria + área segura inferior (barra de gestos do iPhone/Android).
  const { bottom } = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.borderStrong,
          borderTopWidth: 1,
          height: 64 + bottom,
          paddingTop: 8,
          paddingBottom: Math.max(bottom, 8),
        },
        tabBarLabelStyle: { fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="doacoes"
        options={{
          title: 'Doações',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'grid' : 'grid-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="trocas"
        options={{
          title: 'Trocas',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'repeat' : 'repeat-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
