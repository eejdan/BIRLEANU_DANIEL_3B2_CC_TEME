import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Loader } from '@/components/ui';
import { AccountScreen } from './lib/account/AccountScreen';
import { AuthScreen } from './lib/auth/AuthScreen';
import { FocusScreen } from './lib/focus/FocusScreen';
import { HomeScreen } from './lib/home/HomeScreen';
import { PlannerScreen } from './lib/planner/PlannerScreen';
import { EventEditorScreen } from './lib/planner/EventEditorScreen';
import { TaskEditorScreen } from './lib/planner/TaskEditorScreen';
import { WakeupEditorScreen } from './lib/planner/WakeupEditorScreen';
import { SmartScreen } from './lib/smart/SmartScreen';
import { theme } from './lib/theme';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

const tabMeta: Record<string, { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  Home: { label: 'Home', icon: 'view-dashboard-outline' },
  Planner: { label: 'Planner', icon: 'calendar-month-outline' },
  Focus: { label: 'Focus', icon: 'timer-sand' },
  Smart: { label: 'Smart', icon: 'lightbulb-on-outline' },
  Account: { label: 'Account', icon: 'account-circle-outline' }
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.outlineSubtle,
    primary: theme.colors.primary
  }
};

function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabShell}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const active = state.index === index;
          const meta = tabMeta[route.name];

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              accessibilityRole="button"
              accessibilityState={active ? { selected: true } : {}}
              accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
              style={({ pressed }) => [
                styles.tabItem,
                active ? styles.tabItemActive : null,
                pressed ? styles.tabItemPressed : null
              ]}
            >
              <MaterialCommunityIcons
                name={meta.icon}
                size={22}
                color={active ? theme.colors.onPrimary : theme.colors.textMuted}
              />
              <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]} numberOfLines={1}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator tabBar={(props) => <AppTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Planner" component={PlannerScreen} />
      <Tab.Screen name="Focus" component={FocusScreen} />
      <Tab.Screen name="Smart" component={SmartScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { loading, token } = useAuth();

  if (loading) {
    return <Loader label="Restoring your workspace..." />;
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background }
      }}
    >
      {!token ? (
        <RootStack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <RootStack.Screen name="MainTabs" component={Tabs} />
          <RootStack.Screen name="EventEditor" component={EventEditorScreen} />
          <RootStack.Screen name="TaskEditor" component={TaskEditorScreen} />
          <RootStack.Screen name="WakeupEditor" component={WakeupEditorScreen} />
        </>
      )}
    </RootStack.Navigator>
  );
}

export default function App() {
  const content = (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webShell}>
        <View style={styles.webFrame}>
          {content}
        </View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  webShell: {
    flex: 1,
    backgroundColor: '#060b15',
    alignItems: 'center'
  },
  webFrame: {
    width: '100%',
    maxWidth: 430,
    minHeight: '100vh' as unknown as number,
    backgroundColor: theme.colors.background,
    overflow: 'hidden'
  },
  tabShell: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineSubtle,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfaceHighest
  },
  tabItemActive: {
    backgroundColor: theme.colors.primary
  },
  tabItemPressed: {
    opacity: 0.86
  },
  tabLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '800'
  },
  tabLabelActive: {
    color: theme.colors.onPrimary
  }
});
