import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { router, Stack } from 'expo-router';
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
      <SafeAreaProvider>
      <SafeAreaView style={styles.container}>     
        <Stack.Screen options={{ headerShown: false }} /> 
        <FlatList
          data={Object.keys(placesByCity)}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePress(item)} style={styles.cityContainer}>
              <Image
                source={require('../../../assets/images/react-logo.png')}
                style={styles.cityImage}
              />
              <View style={styles.cityInfo}>
                <Text style={styles.cityName}>{item}</Text>
                <Text style={styles.savedPlaces}>{placesByCity[item].length} saved places</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.flatListContent}
        />
      </SafeAreaView>
    </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  flatListContent: {
    paddingBottom: 10,
    paddingHorizontal: '5%',
  },
  cityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#353B45',
    borderRadius: 30,
  },
  cityInfo: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 20
  },
  cityName: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  savedPlaces: {
    color: '#ffffff',
    fontSize: 14,
  },
  cityImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});