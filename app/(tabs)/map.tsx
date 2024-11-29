import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore, {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps'; 
import * as Location from 'expo-location';

// TODO:: 
// 1. Put pins on map taken from Firestore
// 2. Decide if we want to use google maps - if so, need to use PROVIDER_GOOGLE in MAPVIEW.
// 3. Functionality to zoom into map and click on pin to show modal giving quick-view of location



//add provider={PROVIDER_GOOGLE} to <MapView> 
const INITAL_REGION = {
  latitude: 37.33,
  longitude: -122,
  latitudeDelta: 2,
  longitudeDelta: 2
}

export default function Map(){
    const user = auth().currentUser; 
    const [currentRegion, setCurrentRegion] = useState<Region | undefined>();
    
    //Get permission to track user and get current location 
    useEffect(() => {
      async function getCurrentLocation(){
          let {status} = await Location.requestBackgroundPermissionsAsync();
          if (status !== 'granted'){
              alert("Permission to access location was denied")
              return;
          }
          let location = await Location.getCurrentPositionAsync({});
          console.log(JSON.stringify(location));
          setCurrentRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 2,
            longitudeDelta: 2
          }); 
      }
      getCurrentLocation();
  }, []);
    
    return (
      <View style={styles.container}>
        <MapView 
          style={StyleSheet.absoluteFill} 
          // provider={PROVIDER_GOOGLE}
          initialRegion={currentRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
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
    map: {
      width: '100%',
      height: '100%'
    }
});