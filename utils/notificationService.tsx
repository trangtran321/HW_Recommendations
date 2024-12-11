import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, FlatList, Pressable } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore, {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import * as Notifications from 'expo-notifications';
import Button from '@/components/Button';
import * as Location from 'expo-location';
import * as BackgroundFetch from 'expo-background-fetch';
import { BackgroundFetchStatus } from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as geolib from 'geolib';
import { sleep } from '@/utils/sleep';

const LOCATION_TASK = 'background-location-tracking';
const NOTIFICATION_COOLDOWN = 60000 * 3; //3 minutes 
const SIGNIFICANT_DISTANCE = 100; // meters - considered significant change enought to send another 
const MIN_TIME_BETWEEN_UPDATES = 60000 * 1; 
const DELAY = 1000; // 1 second 

interface LastKnownLocation {
    latitude: number;
    longitude: number;
    city: string | null;
    timestamp:  number;
}
const processLocation = async (location:Location.LocationObject, uid:string) => {
    const now = Date.now(); 
    let nearby:any  = []; 
    let inRange = false;
    const dbRef = firestore().collection("users").doc(uid);
      
      //get user's last known location in order to see if they have moved significantly (> 100m)
      const lastKnownLocation = (await dbRef.collection("lastKnownLoc").doc('loc').get()).data(); 
      const currenCoords : Location.LocationGeocodedLocation = {longitude: location.coords.longitude, latitude: location.coords.latitude};
      const hasMovedSignificantly = !lastKnownLocation || geolib.getDistance(
            {latitude: lastKnownLocation.latitude, longitude: lastKnownLocation.longitude},
            currenCoords,
            1
      ) > SIGNIFICANT_DISTANCE; 

      const hasEnoughTimePassed = !lastKnownLocation || (now - lastKnownLocation.timestamp) > MIN_TIME_BETWEEN_UPDATES; 
      console.log(hasEnoughTimePassed, hasMovedSignificantly, lastKnownLocation?.timestamp, now)
      
      //only if user has moved significantly, do we try to send a notification 
      if (hasMovedSignificantly && hasEnoughTimePassed){
          const region = (await Location.reverseGeocodeAsync(currenCoords))
          const city = region[0].city 
          console.log(region[0]);
          const currentLocation: LastKnownLocation = {
              city: city,
              longitude: location.coords.longitude,
              latitude: location.coords.latitude,
              timestamp: now
          }
          //add location to database
          const lkl = (await dbRef.collection("lastKnownLoc").doc('loc').set(currentLocation));
          const places = (await dbRef.collection("places").get()).docs.map(doc => doc.data());
        
          //add to nearby places array if within a certain distance from current location.
          const groupedByCity = places.reduce((acc, place) => {
            const city = place.city || "Unknown City";
            if (city == currentLocation.city){
                 inRange = geolib.isPointWithinRadius(
                      {latitude: Number(place.lat), longitude: Number(place.long)},
                      {latitude: currenCoords.latitude, longitude: currenCoords.longitude},
                      5000 //5 kms 
                    )
                 if (inRange) 
                  {
                   nearby.push(place);
                   inRange = false; 
                  }
              }
              return acc;
          }, {});
          //32.31316410000001 -106.7799125
          //37.8199 -122.4786
          console.log(nearby)
          if (nearby.length > 0){
            await sendNotification(nearby, dbRef);
            console.log("in range!"); 
          }
    }
}

const delayedProcessLocation = sleep(processLocation, DELAY); 

TaskManager.defineTask(LOCATION_TASK, async ({data, error}) => {
  const now = Date.now();
  const user = auth().currentUser; 
  
  console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`);
  try{ 
    if (error){
      console.log("background fetch error: ", error)
      return;
    }
    if (data && user){
      const { locations } = data as {locations: Location.LocationObject[]}; 
      const dbRef = firestore().collection("users").doc(user.uid);
      await delayedProcessLocation(locations[0], user.uid); 
    }
  }catch (error){
    console.log(error); 
  }
});

async function sendNotification(nearby: any[], dbRef:FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> ){
    const lastNotificationTime = (await dbRef.collection("notification").doc('lastNotification').get()).data();
    const currentTime = Date.now(); 

    if (lastNotificationTime){
        if (currentTime - lastNotificationTime.time <= NOTIFICATION_COOLDOWN){
            console.log("Skipping notification because time limit has not expired.");
            return;
        }
    }

    const { status } = await Notifications.requestPermissionsAsync();
    console.log(status)
    if (status == 'granted') {
        Notifications.setNotificationHandler({
        handleNotification: async() => ({
            shouldShowAlert: true, 
            shouldPlaySound: false,
            shouldSetBadge: false,
            }),
        })

        const bod = nearby[0]?.name;
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title:`${bod} is close by!`,
                body: "Click here to see it on the map.",
                data: {
                    url: '../map'
                }, 
            },
            trigger: null
        });

        if(notificationId){
            (await dbRef.collection("notification").doc('lastNotification').set({time: currentTime}));
            console.log("Sent Notification!", notificationId);
        } else {
            console.log("Failed to send notification."); 
        }
        
    }
}

export default function NotificationService(){
    const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    (async () => {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        console.log('Foreground permission denied');
        return;
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.log('Background permission denied');
        return;
      }

      await Notifications.requestPermissionsAsync();
    })();
  }, []);

  const startLocationTracking = async () => {
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: MIN_TIME_BETWEEN_UPDATES,
      distanceInterval: 1,
      deferredUpdatesDistance: 1,
      deferredUpdatesInterval: MIN_TIME_BETWEEN_UPDATES,
      foregroundService: {
        notificationTitle: 'Location Tracking',
        notificationBody: 'Tracking your location in the background',
      },
    });
    setIsTracking(true);
  };

  const stopLocationTracking = async () => {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK);
    setIsTracking(false);
  };

    return (
      <View >
        <Pressable
          style={{
            backgroundColor: '#ffd33d',
            padding: 10,
            borderRadius: 5,
            marginBottom: 15}}
          onPress={isTracking ? stopLocationTracking : startLocationTracking}
        >
          <Text>{isTracking ? 'Stop Tracking' : 'Start Tracking'}</Text>
       </Pressable>
    </View>
    )
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#25292e',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#ffff',
      borderRadius: 10,
      width: '60%',
      margin: 5,
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