// Configuración global de Jest para React Native
import 'react-native-gesture-handler/jestSetup';

// Mock de AsyncStorage
// jest.mock('@react-native-async-storage/async-storage', () => require('./__mocks__/asyncStorageMock'));

// Mock de expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      API_BASE_URL: 'http://localhost:3000/api'
    }
  },
  manifest: {
    debuggerHost: 'localhost:8081'
  }
}));

// Mock de react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock de react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock de expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

// Mock de expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock de expo-network
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Configurar fetch global para tests
global.fetch = jest.fn();

// Mock global de todos los iconos de @expo/vector-icons y react-native-paper
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'Icon',
  MaterialCommunityIcons: 'Icon',
  Ionicons: 'Icon',
  FontAwesome: 'Icon',
  FontAwesome5: 'Icon',
  Feather: 'Icon',
  AntDesign: 'Icon',
  Entypo: 'Icon',
  EvilIcons: 'Icon',
  Foundation: 'Icon',
  Octicons: 'Icon',
  SimpleLineIcons: 'Icon',
  Zocial: 'Icon',
}));
jest.mock('react-native-paper/src/components/Icon', () => 'Icon');

// Ajustar el mock de console.error para filtrar advertencias irrelevantes de act() de iconos y AuthProvider
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (
        args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('An update to Icon inside a test was not wrapped in act') ||
        args[0].includes('is not a valid icon name for family') ||
        args[0].includes('An update to AuthProvider inside a test was not wrapped in act') ||
        args[0].includes('An update to TestComponent inside a test was not wrapped in act')
      )
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock global de Alert.alert para todos los tests
let globalAlertCallCount = 0;
beforeEach(() => {
  globalAlertCallCount = 0;
  jest.spyOn(require('react-native').Alert, 'alert').mockImplementation((title, message, buttons) => {
    globalAlertCallCount++;
    console.log('[MOCK ALERT]', title, message, buttons);
    // Ejecutar el handler de confirmación solo en la primera llamada (confirmación)
    if (globalAlertCallCount === 1) {
      const confirm = buttons && buttons.find(b => b.text === 'Confirmar');
      if (confirm && typeof confirm.onPress === 'function') {
        confirm.onPress();
      }
    }
  });
}); 