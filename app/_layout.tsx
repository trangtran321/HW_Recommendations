import { Stack, useRouter, useSegments } from "expo-router";
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { useEffect, useRef, useState } from "react";
import { Text, View, Button, Platform } from "react-native";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

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
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
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

  useEffect(() => {
    //fetch Expo Push Token
    registerForPushNotificationsAsync().then((token)=> 
      setExpoPushToken(token)
    );
  }, []); 
  console.log('Token: ', expoPushToken); 



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
        {/* Sign in page automaticcaly shows up */}
        <Stack.Screen name="index" options={{title: "Sign In"}}/>
      </Stack>
    )
  }
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}
