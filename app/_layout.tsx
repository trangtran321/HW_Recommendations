import { Stack, useRouter, useSegments } from "expo-router";
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { useEffect, useRef, useState } from "react";
import * as Notifications from 'expo-notifications';
import { NotificationProvider } from "@/utils/notificationContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true
  })
})

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
    //initialize firebase to sign in 
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
      <NotificationProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
          <Stack.Screen name="+not-found"/>
        </Stack>
      </NotificationProvider>
    )
  }
  else{
    return (
      <Stack> 
        {/* Sign in page automaticcaly shows up */}
        <Stack.Screen name="index" options={{title: "Sign In"}}/>
      </Stack>
    )
  }
}


