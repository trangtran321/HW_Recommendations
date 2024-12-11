import { Text, View, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import HwLogo from "../assets/images/helloworld.svg"; 
import Button from '../components/Button';
import { useState } from 'react';
import {
    GoogleSignin,
    isSuccessResponse,
  } from '@react-native-google-signin/google-signin';
import { router, Stack } from 'expo-router';
import auth from '@react-native-firebase/auth';
import 'react-native-get-random-values' 

interface User{
    id: string;
    name: string | null;
    email: string;
    photo: string | null;
    familyName: string | null;
    givenName: string | null;
}

GoogleSignin.configure({
    scopes: ['email'], //API that will be accessed on behalf of user, defaults to email & profile
    webClientId: '323188340295-4trnfbhsg5vbs7gmr6d96r3db7hr2ktm.apps.googleusercontent.com',
    offlineAccess: true, //allow access to GoogleAPI on behalf of user from our server
});

export default function Index() {

    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState<User | undefined>();
    const [loading, setLoading] = useState(false); 

    const _signIn = async () => {
      setLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            if (isSuccessResponse(response)){
                setUser(response.data.user);
            
            setLoggedIn(true); 
            const credential = auth.GoogleAuthProvider.credential(
                response.data.idToken
            );
            const userInfo = await auth().signInWithCredential(credential);
            router.replace('/explore')
            }
        }
        catch (error: any){
           console.log("Error signing in:", error);
        }
        finally { 
          setLoading(false);
        }
    };

    const signout = async () => {
        try {
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut(); 
            auth().signOut().then(()=>{
              alert("You are signed out");
            });
            setLoggedIn(false);
        }
        catch (error : any){
            console.error(error); 
        }
    }
  
  return (
    <>
     <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.container} >
    <View style={styles.logo_wrapper}>
      <HwLogo width={125} height={125}/>
    </View>
    {loading ? (
      <ActivityIndicator size={'small'} style={{margin: 28}} /> 
    ) : (
      <TouchableOpacity style={styles.button} onPress={_signIn}>
                    <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>
        //  <FontAwesome.Button name="google" backgroundColor="#4285F4" onPress={_signIn}>
        // Sign In
        // </FontAwesome.Button>
      )
    }
    </View>
    </>
    
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#25292e',
      alignItems: 'center',
      justifyContent: 'center',
  },
  text: {
      color: '#ffff',
  },
  button: {
      backgroundColor: '#767c85',
      borderRadius: 8,
      marginTop: 30,
      paddingVertical: 8,
      paddingHorizontal: 25,
      shadowColor: "#000",
     
  },
  buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
  },
  logo_wrapper: {
      alignItems: 'center',
      padding: 30,
  },
});