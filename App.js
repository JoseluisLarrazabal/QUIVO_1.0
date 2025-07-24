import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useFonts as useMontserrat, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import { appTheme } from './src/theme';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import DashboardScreen from './src/screens/DashboardScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import LoginScreen from './src/screens/LoginScreen';
import RechargeScreen from './src/screens/RechargeScreen';
import CardsScreen from './src/screens/CardsScreen';
import RegisterCardScreen from './src/screens/RegisterCardScreen';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'History') {
            iconName = 'history';
          } else if (route.name === 'Recharge') {
            iconName = 'account-balance-wallet';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: appTheme.paperTheme.colors.primary,
        tabBarInactiveTintColor: appTheme.paperTheme.colors.secondaryText,
        tabBarStyle: {
          backgroundColor: appTheme.paperTheme.colors.background,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: appTheme.paperTheme.colors.primary,
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
          height: 64,
        },
        tabBarLabelStyle: {
          fontFamily: 'Montserrat_400Regular',
          fontSize: 13,
          marginBottom: 4,
        },
        tabBarItemStyle: {
          borderRadius: 16,
        },
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarPressColor: appTheme.paperTheme.colors.accent,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Mi Tarjeta' }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ title: 'Historial' }}
      />
      <Tab.Screen 
        name="Recharge" 
        component={RechargeScreen} 
        options={{ title: 'Recargar' }}
      />
    </Tab.Navigator>
  );
};

// Drawer custom content
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Avatar, Text as PaperText, Divider } from 'react-native-paper';

function CustomDrawerContent(props) {
  const { user } = useAuth();
  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: appTheme.paperTheme.colors.background }}>
      <View style={{ backgroundColor: appTheme.paperTheme.colors.primary, padding: 24, alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <Avatar.Icon size={64} icon="account-circle" color={appTheme.paperTheme.colors.primary} style={{ backgroundColor: appTheme.paperTheme.colors.accent, marginBottom: 8 }} />
        <PaperText style={{ color: appTheme.paperTheme.colors.accent, fontFamily: 'Montserrat_400Regular', fontSize: 18 }}>{user?.nombre || 'Usuario'}</PaperText>
        {user?.email && <PaperText style={{ color: appTheme.paperTheme.colors.background, fontFamily: 'Montserrat_400Regular', fontSize: 13 }}>{user.email}</PaperText>}
      </View>
      <Divider style={{ marginVertical: 8, backgroundColor: appTheme.paperTheme.colors.primary, opacity: 0.1 }} />
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="MainTabs"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveBackgroundColor: appTheme.paperTheme.colors.primary,
        drawerActiveTintColor: appTheme.paperTheme.colors.accent,
        drawerInactiveTintColor: appTheme.paperTheme.colors.primary,
        drawerLabelStyle: {
          fontFamily: 'Montserrat_400Regular',
          fontSize: 16,
        },
        drawerStyle: {
          backgroundColor: appTheme.paperTheme.colors.background,
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
          width: 260,
        },
        headerShown: false,
        gestureEnabled: true,
        drawerType: 'slide',
      }}
    >
      <Drawer.Screen name="Inicio" component={TabNavigator} options={{ title: 'Inicio' }} />
      <Drawer.Screen name="Cards" component={CardsScreen} options={{ title: 'Mis Tarjetas' }} />
      <Drawer.Screen name="RegisterCard" component={RegisterCardScreen} options={{ title: 'Registrar Tarjeta' }} />
    </Drawer.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  // Mostrar un loader mientras se verifica el estado de autenticación
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={DrawerNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  // Cargar Montserrat desde Google Fonts
  const [montserratLoaded] = useMontserrat({
    Montserrat_400Regular,
  });
  // Cargar Chicalo desde assets/fonts
  const [chicaloLoaded] = Font.useFonts({
    'Chicalo-Regular': require('./assets/fonts/Chicalo-Regular.otf'),
  });
  if (!montserratLoaded || !chicaloLoaded) {
    return <AppLoading />;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={appTheme.paperTheme}>
        <AuthProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}