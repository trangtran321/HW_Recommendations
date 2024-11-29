import { Stack} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AddLayout(){
    return (
        <Stack> 
          <Stack.Screen name="index" options={{title: "Add Recommendations"}}/>
      </Stack>
    )
}

