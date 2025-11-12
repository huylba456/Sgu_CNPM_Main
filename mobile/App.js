import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { OrdersProvider } from './src/context/OrdersContext';
import { useAuth } from './src/hooks/useAuth';
import { colors } from './src/styles/theme';
import HomeScreen from './src/screens/HomeScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import { useCart } from './src/hooks/useCart';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { user } = useAuth();
  const role = user?.role;
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home-outline',
            Products: 'fast-food-outline',
            Cart: 'cart-outline',
            Orders: 'airplane-outline',
            Profile: 'person-circle-outline',
            Admin: 'settings-outline',
            Restaurant: 'business-outline'
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        }
      })}
    >
      {role === 'admin' ? (
        <>
          <Tab.Screen name="Admin" component={AdminNavigator} options={{ title: 'Quản trị' }} />
          <Tab.Screen name="Restaurant" component={RestaurantNavigator} options={{ title: 'Nhà hàng' }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
        </>
      ) : role === 'restaurant' ? (
        <>
          <Tab.Screen name="Restaurant" component={RestaurantNavigator} options={{ title: 'Nhà hàng' }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
        </>
      ) : (
        <>
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
          <Tab.Screen name="Products" component={ProductsScreen} options={{ title: 'Thực đơn' }} />
          <Tab.Screen
            name="Cart"
            component={CartScreen}
            options={{
              title: 'Giỏ hàng',
              tabBarBadge: cartCount > 0 ? cartCount : undefined,
              tabBarBadgeStyle: { backgroundColor: colors.accent, color: colors.text }
            }}
          />
          <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: 'Đơn hàng' }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
        </>
      )}
    </Tab.Navigator>
  );
};

const RootNavigator = () => (
  <RootStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
      contentStyle: { backgroundColor: colors.background }
    }}
  >
    <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
    <RootStack.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng nhập' }} />
    <RootStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Chi tiết món' }} />
    <RootStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Thanh toán' }} />
    <RootStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Chi tiết đơn hàng' }} />
  </RootStack.Navigator>
);

const AppProviders = ({ children }) => (
  <AuthProvider>
    <OrdersProvider>
      <CartProvider>{children}</CartProvider>
    </OrdersProvider>
  </AuthProvider>
);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProviders>
          <NavigationContainer>
            <StatusBar style="dark" backgroundColor={colors.background} />
            <RootNavigator />
          </NavigationContainer>
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
