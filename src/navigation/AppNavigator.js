import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabs from './MainTabs';
import TransactionFormScreen from '../screens/TransactionFormScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="TransactionForm"
        component={TransactionFormScreen}
        options={{
          title: 'Transacción',
        }}
      />
    </Stack.Navigator>
  );
}