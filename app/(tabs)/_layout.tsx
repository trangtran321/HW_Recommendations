import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout(){
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#ffd33d',
                headerStyle: { 
                    backgroundColor: '#25292e',
                },
                headerShadowVisible: false,
                headerTintColor: '#fff',
                tabBarStyle: {
                    backgroundColor: '#25292e',
                },
            }}>
            <Tabs.Screen 
                name="explore" 
                options={{
                    title: 'Explore',
                    tabBarIcon: ({color, focused}) => (
                        <Ionicons name={focused? 'home-sharp' : 'home-outline'} color={color} size={24}/>
                    ),
                }}/>
            <Tabs.Screen 
                name="map" 
                options={{
                    title: 'Map',
                    tabBarIcon: ({color, focused}) => (
                        <Ionicons name={focused? 'map' : 'pin'} color={color} size={24}/>
                    ),
                }}/>
            <Tabs.Screen 
                name="addRec" 
                options={{
                    title: 'Add Reccommendations',
                    tabBarIcon: ({color, focused}) => (
                        <Ionicons name={focused? 'add-circle' : 'add-circle-outline'} color={color} size={24}/>
                    ),
                }}/>
            <Tabs.Screen 
                name="recList" 
                options={{
                    title: 'List',
                    tabBarIcon: ({color, focused}) => (
                        <Ionicons name={focused? 'list-outline' : 'list-sharp'} color={color} size={24}/>
                    ),
                }}/>
        </Tabs>
    )
}

