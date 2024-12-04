import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore, {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import * as Notifications from 'expo-notifications';
import Button from '@/components/Button';
import * as Location from 'expo-location';
import * as BackgroundFetch from 'expo-background-fetch';
import { BackgroundFetchStatus } from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as geolib from 'geolib';

const BACKGROUND_FETCH_TASK = 'location-tracking';

// 1. Define the task by providing a name and the function that should be executed
// Note: This needs to be called in the global scope (e.g outside of your React components)
let nearby:any  = []; 
let inRange = false;

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async ({data, error}) => {
  const now = Date.now();
  const user = auth().currentUser; 
  console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`);
  try{ 
    if (error){
      console.log("background fetch error: ", error)
      return;
    }
    if (data && user){
      const { locations } = data; 
      const currenCoords : Location.LocationGeocodedLocation = {longitude: locations[0].coords.longitude, latitude: locations[0].coords.latitude};
      const currentCity = (await Location.reverseGeocodeAsync(currenCoords))[0].city;
      
      const placesRef = firestore().collection("users").doc(user.uid);
      const places = (await placesRef.collection("places").get()).docs.map(doc => doc.data());
      const groupedByCity = places.reduce((acc, place) => {
        const city = place.city || "Unknown City";
        if (!acc[city]){
            acc[city] = []; 
        }
        if (city == currentCity){
          nearby.push(place);
        }
        acc[city].push(place);
        return acc;
      }, {});
      
      console.log(nearby)

      inRange = geolib.isPointWithinRadius(
        {latitude: 51.525, longitude: 7.4575},
        {latitude: 51.5175, longitude: 7.457},
        5000
      )
      if (inRange){
        console.log("in range!"); 
      }
    }
  }catch (error){
    console.log(error); 
  }

  // Be sure to return the successful result type!
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

async function registerBackgroundFetchAsync() {
  return await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 2, // 60 * 15 = 15 minutes
  });
}

async function unregisterBackgroundFetchAsync() {
  try{
    const unregistered = await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
  }
  catch (error){
    console.log("Error in unregistering", error);
  }
  return 
}

export default function Explore(){
  const [isRegistered, setIsRegistered] = useState(false);
  const [status, setStatus] = useState<BackgroundFetchStatus |null>(null);

  useEffect(() => {
    checkStatusAsync();
    const config = async () => {
            let resf = await Location.requestForegroundPermissionsAsync();
            let resb = await Location.requestBackgroundPermissionsAsync();
            if (resf.status != 'granted' && resb.status !== 'granted'){
              console.log("Permission to access location was denied.");
            }else{
              console.log("Permission to access location granted.");
            }
          }
          config();
  }, [isRegistered]);

  const checkStatusAsync = async () => {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    setStatus(status);
    setIsRegistered(isRegistered);
  };

  const toggleFetchTask = async () => {
    if (isRegistered) {
      if (await Location.hasStartedLocationUpdatesAsync(BACKGROUND_FETCH_TASK)) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_FETCH_TASK);
      }
      await unregisterBackgroundFetchAsync();
    } else {
      if (!(await Location.hasStartedLocationUpdatesAsync(BACKGROUND_FETCH_TASK))) {
        await Location.startLocationUpdatesAsync(BACKGROUND_FETCH_TASK, {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 10, 
          distanceInterval: 1,
        });
      }
      await registerBackgroundFetchAsync();
    }
    checkStatusAsync();

  };

    async function schedulePushNotifications(){
        const { status } = await Notifications.requestPermissionsAsync();
        const bod = nearby[0]?.city;
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "You've got mail!",
                body: bod,
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
    if (inRange){
      schedulePushNotifications();
    }
    return (
      <View style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.text}>
          Background fetch status:{' '}
          <Text style={styles.text}>
            {status && BackgroundFetch.BackgroundFetchStatus[status]}
          </Text>
        </Text>
        <Text style={styles.text}>
          Background fetch task name:{' '}
          <Text style={styles.text}>
            {isRegistered ? BACKGROUND_FETCH_TASK : 'Not registered yet!'}
          </Text>
        </Text>
      </View>
      <View><Text style={styles.text}>{nearby[0]?.city}</Text></View>
      <View style={styles.container}></View>
      <Button
        label={isRegistered ? 'Unregister BackgroundFetch task' : 'Register BackgroundFetch task'}
        onPress={toggleFetchTask}
      />
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

// //Currently, this shows how scheduled LOCAL notifications are sent. 
// //Just need access in order to apply to PUSH notifications. 

// var l1; 
// var l2; 

// TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({data, error}) => {
//   if (error){
//     console.log('Location tracking task error: ', error);
//     return;
//   } 
//   if (data){
//     const {locations} = data;
//     let lat = locations[0].coords.latitude;
//     let long = locations[0].coords.longitude;

//     l1 = lat;
//     l2 = long; 

//     console.log(`${new Date(Date.now()).toLocaleString()}: ${lat}, ${long}`); 
//   }
// })
// export default function Explore(){
//   const [locationStarted, setLocationStarted] = useState(false); 

//   const startLocationTracking = async () => {
//     await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
//         accuracy: Location.Accuracy.Highest,
//         timeInterval: 5000,
//         distanceInterval: 0,
//     });
//     const hasStarted = await Location.hasStartedLocationUpdatesAsync(
//       LOCATION_TRACKING_TASK
//     ); 
//     setLocationStarted(hasStarted); 
//     console.log('tracking started?', hasStarted); 
//   }

//   useEffect(()=>{
//     const config = async () => {
//       let resf = await Location.requestForegroundPermissionsAsync();
//       let resb = await Location.requestBackgroundPermissionsAsync();
//       if (resf.status != 'granted' && resb.status !== 'granted'){
//         console.log("Permission to access location was denied.");
//       }else{
//         console.log("Permission to access location granted.");
//       }
//     }
//     config();
//   }, []);

//   const startLocation = ()=> {
//     startLocationTracking();
//   }

//   const stopLocation = ()=> {
//     setLocationStarted(false); 
//     TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK)
//       .then((tracking)=>{
//         if (tracking){
//           Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
//         }
//       })
//   }

//   return (
//     <View style={{backgroundColor: '#25292e'}}>
//       {locationStarted ? 
//         <Button label={"Stop Tracking"} onPress={stopLocation}/>
//       : 
//         <Button label={"Start Tracking"} onPress={startLocation}/>}
//     </View>
//   )
// }

// import { useEffect, useState } from 'react';
// import { View, StyleSheet, Text, FlatList } from 'react-native';
// import auth from '@react-native-firebase/auth';
// import firestore, {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
// import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'; 
// import * as Notifications from 'expo-notifications';
// import Button from '@/components/Button';
// import * as Location from 'expo-location';
// import * as BackgroundFetch from 'expo-background-fetch';
// import { BackgroundFetchStatus } from 'expo-background-fetch';
// import * as TaskManager from 'expo-task-manager';

// const BACKGROUND_FETCH_TASK = 'background-fetch-location';
// //Currently, this shows how scheduled LOCAL notifications are sent. 
// //Just need access in order to apply to PUSH notifications. 

// // 1. Define the task by providing a name and the function that should be executed
// // Note: This needs to be called in the global scope (e.g outside of your React components)
// TaskManager.defineTask(BACKGROUND_FETCH_TASK, async ({data, error}) => {
//   const now = Date.now();
//   console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`);
//   try{ 
//     if (error){
//       console.log("background fetch error: ", error)
//       return;
//     }
//     if (data){
//       console.log("data: ");
//       console.log(data);
//       const { locations } = data;
//       console.log(locations);
//       const location = locations[0];
//       console.log(location);
//     }
//   }catch (error){
//     console.log(error); 
//   }
//   // Be sure to return the successful result type!
//   return BackgroundFetch.BackgroundFetchResult.NewData;
// });

// async function registerBackgroundFetchAsync() {
//   return await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
//     minimumInterval: 1, // 15 minutes
//     stopOnTerminate: false, // android only,
//     startOnBoot: true, // android only
//   });
// }

// async function unregisterBackgroundFetchAsync() {
//   try{
//     const unregistered = await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
//   }
//   catch (error){
//     console.log("Error in unregistering", error);
//   }
//   return 
// }

// export default function NotificationExample(){
//   const [isRegistered, setIsRegistered] = useState(false);
//   const [status, setStatus] = useState<BackgroundFetchStatus |null>(null);

//   useEffect(() => {
//     checkStatusAsync();
//   }, []);

//   const checkStatusAsync = async () => {
//     const status = await BackgroundFetch.getStatusAsync();
//     const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
//     setStatus(status);
//     setIsRegistered(isRegistered);
//   };

//   const toggleFetchTask = async () => {
//     if (isRegistered) {
//       if (await Location.hasStartedLocationUpdatesAsync(BACKGROUND_FETCH_TASK)) {
//         await Location.stopLocationUpdatesAsync(BACKGROUND_FETCH_TASK);
//       }
//       await unregisterBackgroundFetchAsync();
//     } else {
//       if (!(await Location.hasStartedLocationUpdatesAsync(BACKGROUND_FETCH_TASK))) {
//         await Location.startLocationUpdatesAsync(BACKGROUND_FETCH_TASK, {
//           accuracy: Location.Accuracy.BestForNavigation,
//         });
//       }
//       await registerBackgroundFetchAsync();
//     }
//     checkStatusAsync();

//   };
//     async function schedulePushNotifications(){
//         const { status } = await Notifications.requestPermissionsAsync();

//         await Notifications.scheduleNotificationAsync({
//             content: {
//                 title: "You've got mail!",
//                 body: "Here is the body",
//                 data: {
//                     data: "goes here"
//                 }, 
//             },
//             trigger: { 
//                 seconds: 15, 
//                 type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL}
//         });

//         // await fetch('https://exp.host/--/api/v2/push/send', {
//         //   method: 'POST',
//         //   headers: {
//         //     Accept: 'application/json',
//         //     'Accept-encoding': 'gzip, deflate',
//         //     'Content-Type': 'application/json',
//         //   },
//         //   body: JSON.stringify(onmessage),
//         // });
//     }
//     return (
//       <View style={styles.container}>
//       <View style={styles.container}>
//         <Text>
//           Background fetch status:{' '}
//           <Text style={styles.text}>
//             {status && BackgroundFetch.BackgroundFetchStatus[status]}
//           </Text>
//         </Text>
//         <Text>
//           Background fetch task name:{' '}
//           <Text style={styles.text}>
//             {isRegistered ? BACKGROUND_FETCH_TASK : 'Not registered yet!'}
//           </Text>
//         </Text>
//       </View>
//       <View style={styles.container}></View>
//       <Button
//         label={isRegistered ? 'Unregister BackgroundFetch task' : 'Register BackgroundFetch task'}
//         onPress={toggleFetchTask}
//       />
//     </View>
//         // <View style={styles.container}>
//         //     <Text style={styles.text}>Notification Example </Text>
//         //     <Button 
//         //         label={"Push for Notification."}
//         //         onPress={schedulePushNotifications}/> 
            
//         // </View>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//       flex: 1, 
//       backgroundColor: '#25292e',
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//     text: {
//       color: '#ffff',
//     },
//     button: {
//       fontSize: 20,
//       textDecorationLine: 'underline',
//       color: '#ffff',
//     },
//     logo_wrapper: {
//       alignItems: 'center',
//       padding: 30,
//     }
//   });