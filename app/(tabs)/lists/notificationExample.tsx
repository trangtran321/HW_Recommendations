import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore, {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'; 
import * as Notifications from 'expo-notifications';
import Button from '@/components/Button';

//Currently, this shows how scheduled LOCAL notifications are sent. 
//Just need access in order to apply to PUSH notifications. 

export default function NotificationExample(){
    
    async function schedulePushNotifications(){
        const { status } = await Notifications.requestPermissionsAsync();

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "You've got mail!",
                body: "Here is the body",
                data: {
                    data: "goes here"
                }, 
            },
            trigger: { 
                seconds: 15, 
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL}
        });

        // await fetch('https://exp.host/--/api/v2/push/send', {
        //   method: 'POST',
        //   headers: {
        //     Accept: 'application/json',
        //     'Accept-encoding': 'gzip, deflate',
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify(onmessage),
        // });
    }
    return (
        <View style={styles.container}>
            <Text style={styles.text}>List of Recommendations by City </Text>
            <Button 
                label={"Push for Notification."}
                onPress={schedulePushNotifications}/> 
            
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
    },
    button: {
      fontSize: 20,
      textDecorationLine: 'underline',
      color: '#ffff',
    },
    logo_wrapper: {
      alignItems: 'center',
      padding: 30,
    }
  });