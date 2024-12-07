import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import * as Location from 'expo-location';
import Card from '../../../components/Card';
import { SafeAreaProvider } from 'react-native-safe-area-context';

//TODO:: - If list is empty, delete that city 
//       - Pass recommendation data to [city].tsx
//       - Get pictures from google maps API for city and place into image source
//       - LongPress deletes entire city's list

interface Place {
  name: string;
  city: string;
  address: string;
  state: string;
  longitude: number;
  lattitude: number;
}

interface GroupedPlacesByCity {
  [city: string] : Place[];
}

export default function Index(){
  const user = auth().currentUser; 
  const [placesByCity, setPlacesByCity] = useState<GroupedPlacesByCity>({});
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  //Get permission to track user and get current location 
  useEffect(() => {
      async function getCurrentLocation(){
          let {status} = await Location.requestBackgroundPermissionsAsync();
          if (status !== 'granted'){
              alert("Permission to access location was denied")
              return;
          }
          let location = await Location.getCurrentPositionAsync({});
          setLocation(location); 
      }
      getCurrentLocation();
  }, []);

  useEffect (() => {
      //Get user's places
      const fetchPlaces = async () => {
          if(user) {
              const placesRef = firestore().collection("users").doc(user.uid);
              const places = (await placesRef.collection("places").get()).docs.map(doc => doc.data());
              const groupedByCity = places.reduce((acc, place) => {
                  const city = place.city || "Unknown City";
                  if (!acc[city]){
                      acc[city] = []; 
                  }
                  acc[city].push(place);

                  return acc;
              }, {}); 

              setPlacesByCity(groupedByCity);
          }
      }

      fetchPlaces();
  }, [user, placesByCity])

  const handlePress = (city:string) => {
    const recommendations = JSON.stringify(placesByCity[city])
    // console.log(JSON.stringify(recommendations))
    // console.log(`./cityDetails/${city}`);
    router.push({pathname: "./[city]", params: {city: city, recs: recommendations}},
    {relativeToDirectory: true},)
  }
    return (
      <>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <FlatList 
            horizontal={false}
            numColumns={2}
            contentContainerStyle={{alignItems: "stretch"}}
            columnWrapperStyle={styles.citybox}
            style={{width: "100%"}}
            data={Object.keys(placesByCity)}
            renderItem={({item}) => (
                <Card 
                  label={item}
                  imageSource={require('../../../assets/images/react-logo.png')}
                  onPress={()=>{handlePress(item)}}
                  />
            )}
          />
        </SafeAreaView>
    </SafeAreaProvider>
  </>
    )
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#25292e',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
    },
    citybox: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: '#ffff',
    }
  });
