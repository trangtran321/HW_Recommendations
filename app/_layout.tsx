import { Stack, useRouter, useSegments } from "expo-router";
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { useEffect, useState } from "react";

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<Boolean>(false);
  const [initializing, setIntializing] = useState(true); 
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const router = useRouter();
  const segments = useSegments();

  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    console.log("User: ", user);
    setUser(user);
    setIsLoggedIn(true);
    if (initializing) setIntializing(false); 
  }; 

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;  
  }, []);

  useEffect(() => {
    if(initializing) return;

    const inAuthGroup = segments[0] === '(tabs)';

    //if user signed in in background & still on signin page
    if (user && !inAuthGroup){
      router.replace('/(tabs)/explore');
    }

    //if user not valid but trying to access explore, etc. 
    else if (!user && inAuthGroup){
      router.replace('/');
    }
  }, [user, initializing])

  if (isLoggedIn){
    return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
        <Stack.Screen name="+not-found"/>
      </Stack>
    )
  }
  else{
    return (
      <Stack> 
        <Stack.Screen name="index" options={{title: "Sign In"}}/>
      </Stack>
    )
  }
}
