import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore, {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'; 
import * as Notifications from 'expo-notifications';
import Button from '@/components/Button';
import { router, Stack } from 'expo-router';

//TODO: 
//    1.UI/UX to make buttons more pleasing and clear that they are buttons. 
//    2.Ensure that the tab will only ever navigate to this screen and not the other screens. Currently, if 
//      if you enter  onto this screen via tab, click either add one or add many button, click to another tab, 
//      and click the 'Add' tab again it will not open the index file, but will open the add one or add many file. 

export default function Index(){
  const navigateToOne = async () => {
    router.navigate("/(tabs)/add/addOne");
  }

  const navigateToMany = async () => {
    router.navigate("/(tabs)/add/addMany");
  }
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <Text style={styles.text}>How many recommendations would you like to add? </Text>
            <TouchableOpacity style={styles.customButton} onPress={navigateToOne}>
                <Text style={styles.customButtonText}>One Recommendation</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.customButton} onPress={navigateToMany}>
                <Text style={styles.customButtonText}>Multiple Recommendations</Text>
            </TouchableOpacity>      
        </View>
    )
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
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 30,
        margin:20,
        marginTop: -50
    },
    button: {
      fontSize: 20,
      textDecorationLine: 'underline',
      color: '#ffff',
    },
    logo_wrapper: {
      alignItems: 'center',
      padding: 30,
    },
    customButton: {
        backgroundColor: '#ffd33d',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        marginTop: 20,
        width: '70%',
        alignItems: 'center',
    },
    customButtonText: {
        color: '#25292e',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },
  });