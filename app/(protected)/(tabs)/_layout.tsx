import { Tabs } from "expo-router";
import { FontAwesome, Octicons } from '@expo/vector-icons'
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: {
        backgroundColor: "black",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingBottom: 10,
        paddingTop: 10,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "600",
      },
      tabBarActiveTintColor: "white", //#b3270e - color anterior
      tabBarInactiveTintColor: "#9ca3af",
      headerShown: false
       }}>
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: "Dashboard",
          // tabBarIcon: ({ color }) => <FontAwesome name="navicon" size={24} color={color}/>
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color}/>
        }} 
      />
      <Tabs.Screen 
        name="classesgerenciais" 
        options={{ 
          title: "Classes",
          tabBarIcon: ({ color }) => <FontAwesome name="th-large" size={24} color={color}/>
        }} 
      />
      <Tabs.Screen 
        name="categorias" 
        options={{ 
          title: "Categorias",
          tabBarIcon: ({ color }) => <FontAwesome name="th-large" size={24} color={color}/>
        }} 
      />
      <Tabs.Screen 
        name="subcategorias" 
        options={{ 
          title: "Subcategorias",
          tabBarIcon: ({ color }) => <FontAwesome name="th" size={24} color={color}/>
        }} 
      />
      <Tabs.Screen 
        name="detalhamento" 
        options={{ 
          title: "Detalhamento",
          tabBarIcon: ({ color }) => <FontAwesome name="th-list" size={24} color={color}/>
        }} 
      />
    </Tabs>
  );
}
