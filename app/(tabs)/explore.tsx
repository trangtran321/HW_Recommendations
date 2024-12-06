import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import { GoogleSignin} from '@react-native-google-signin/google-signin';
import Button from '../../components/Button';
import { router } from 'expo-router';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import * as Location from 'expo-location';
import NotificationService from '@/utils/notificationService';

//TODO:: This is the current landing page after signing in, we can change it to jsut be the 'map.tsx' file
//We can change this one to be the signout/delete user/profile page of user 

interface Place {
    name: string;
    city: string;
    address: string;
    state: string;
}

interface GroupedPlacesByCity {
    [city: string] : Place[];
}

export default function Explore(){
    const user = auth().currentUser; 
    const [placesByCity, setPlacesByCity] = useState<GroupedPlacesByCity>({});
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    const handleLogout = async () => {
        try {
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut(); 
            auth().signOut().then(()=>{
              alert("You are signed out");
            });
            router.replace('/')
        }
        catch (error : any){
            router.replace('/')
            console.error(error); 
        }
    }

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
    }, [user])


    return (
        <>
            <View style={styles.container}>
                <Text style={styles.text}>Hello, {user?.displayName}</Text>
                <View style={styles.container}>
                    {Object.keys(placesByCity).map(city => (
                        <View style={styles.container} key={city}>
                            <Text style={styles.text}>{city}</Text>
                            <FlatList 
                                data={placesByCity[city]}
                                renderItem={({item}) => (
                                    <Text style={styles.text}> {item.name} </Text>
                                )}
                                keyExtractor={item => item.name}
                            />
                        </View>
                    ))}
                </View>
                <NotificationService/> 
                <Button label="signout" onPress={handleLogout}/>
            </View>
        </>
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
    }
  });