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
import * as SplashScreen from 'expo-splash-screen';
import { appTheme } from './src/theme';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import DashboardScreen from './src/screens/DashboardScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import LoginScreen from './src/screens/LoginScreen';
import RechargeScreen from './src/screens/RechargeScreen';
import CardsScreen from './src/screens/CardsScreen';
import RegisterCardScreen from './src/screens/RegisterCardScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
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
      {/* Header ultra minimalista como Facebook/Gmail */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: appTheme.paperTheme.colors.outline }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Avatar.Icon size={32} icon="account-circle" color={appTheme.paperTheme.colors.primary} style={{ backgroundColor: appTheme.paperTheme.colors.accent, marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <PaperText style={{ color: appTheme.paperTheme.colors.onSurface, fontFamily: 'Montserrat_400Regular', fontSize: 14, fontWeight: '500' }}>
              {user?.nombre || 'Usuario'}
            </PaperText>
          </View>
        </View>
      </View>
      
      {/* Lista de elementos del menú */}
      <View style={{ paddingTop: 4 }}>
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
  );
}

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="MainTabs"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveBackgroundColor: appTheme.paperTheme.colors.primary + '15',
        drawerActiveTintColor: appTheme.paperTheme.colors.primary,
        drawerInactiveTintColor: appTheme.paperTheme.colors.onSurfaceVariant,
        drawerLabelStyle: {
          fontFamily: 'Montserrat_400Regular',
          fontSize: 14,
          fontWeight: '400',
        },
        drawerStyle: {
          backgroundColor: appTheme.paperTheme.colors.background,
          width: 280,
        },
        headerShown: false,
        gestureEnabled: true,
        edgeWidth: 120,
        drawerType: 'slide',
        swipeEnabled: true,
        swipeEdgeWidth: 120,
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
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  // Mantener splash hasta que las fuentes estén listas
  React.useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  const [montserratLoaded] = useMontserrat({
    Montserrat_400Regular,
  });
  const [chicaloLoaded] = Font.useFonts({
    'Chicalo-Regular': require('./assets/fonts/Chicalo-Regular.otf'),
  });

  React.useEffect(() => {
    if (montserratLoaded && chicaloLoaded) {
      SplashScreen.hideAsync();
    }
  }, [montserratLoaded, chicaloLoaded]);

  if (!montserratLoaded || !chicaloLoaded) {
    return null; // SplashScreen se mantiene visible
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={appTheme.paperTheme}>
        <ErrorBoundary>
          <AuthProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </AuthProvider>
        </ErrorBoundary>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}