import { Stack} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

//This is the entry into the lists folder. It has the index file as the default screen to show.

export default function ListsLayout(){
    return (
        <Stack> 
          <Stack.Screen name="index" options={{title: "Cities"}}/>
          <Stack.Screen name="notificationExample" options={{title: "Local Notification Example"}}/>
          <Stack.Screen name="[city]" options={{title: ""}}/>
        </Stack>
    )
}

