import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatisticsPlaceholderScreen from '../screens/StatisticsPlaceholderScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Historial"
        component={HistoryScreen}
      />

      <Tab.Screen
        name="Estadisticas"
        component={StatisticsPlaceholderScreen}
        options={{
          title: 'Estadísticas',
        }}
      />
    </Tab.Navigator>
  );
}