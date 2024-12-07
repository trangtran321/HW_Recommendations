import React, { useState } from 'react';
import {StyleSheet, View, Text, FlatList} from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import Button from '@/components/Button';
import * as ExpoGooglePlaces from 'expo-google-places';
import auth from '@react-native-firebase/auth';
import LocationDetailsModal from '../../../components/LocationDetailsModal';
import LocationEditModal from '../../../components/LocationEditModal';
import firestore, {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

//TODO::
    //UI/UX for modal 
    //Add stars for ratings 
    //Add $$ for costs 
    //Have button to take user to map to see place on map 
    //-----  Version 2 -----
    // - add ability to rate recommendation if visited 
    // - add ability to add your own album to places visited
    // - add ability to share to others via the app 

interface Place {
    placeId: string;
    name: string;
    city: string;
    address: string;
    state: string;
    longitude: number;
    lattitude: number;
  }

export default function City(){
    const user = auth().currentUser; 
    const { city, recs } = useLocalSearchParams();
    const [locationDetails, setLocationDetails] = useState<Pick<ExpoGooglePlaces.Place, "openingHours" | "phoneNumber" | "priceLevel" | "userRatingsTotal" | "website"> 
                                                | undefined>(); 
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditVisible, setIsEditVisible] =  useState(false);
    const [currentLocation, setCurrentLocation] = useState<Place|undefined>();
    let recommendations: Place[] = [];
    
    if (typeof(recs) == "string"){
        recommendations = JSON.parse(recs);
    }

    function handlePress(item: Place) {
        //show modal of information
        setIsModalVisible(true);
        const fetchPredictions = async(search:string) => {
            try{
                const predictions = await ExpoGooglePlaces.fetchPlaceWithSession(search, [
                    "openingHours", 
                    "phoneNumber", 
                    "website", 
                    "priceLevel", 
                    "userRatingsTotal"]);
                console.log(predictions)
                setLocationDetails(predictions); 
            }
            catch (error){
                console.log("Error fetching place details", error);
            }
        };
        fetchPredictions(item.placeId); 
    }

    const onModalClose = () => {
        setIsModalVisible(false);
    }

    const onEditClose = () => {
        setIsEditVisible(false);
    }

    function handleLongPress(item:Place) {
        setCurrentLocation(item); 
        setIsEditVisible(true);
        console.log("long pressed!");
    }

    async function deletePlace(item:Place|undefined){
        setCurrentLocation(item);
        if (user && item){
            try { 
                const placesRef = firestore().collection("users").doc(user.uid);
                // const cityRef = (await placesRef.collection("places").doc(item.city))
                const places = (await placesRef.collection("places").get()).docs.map(doc => {return {data: doc.data(), id: doc.id} });
                
                places.forEach(async (place)=>{
                    if (place.data.name == item.name){
                        await placesRef.collection("places").doc(place.id).delete(); 
                        alert("Your recommendation has been deleted.");
                    }
                })
                //reset the recommendations array so that you can get updated values
                const plax = (await placesRef.collection("places").get()).docs;
                console.log(plax);
            }    
            catch (error){
                console.log("Error deleting place:", error);
            }
        }
    }

    return(
        <View style={styles.container}>
            <Text style={styles.header}> 
                {city}
            </Text>
            <View style={styles.body}>
                <FlatList 
                    horizontal={false}
                    contentContainerStyle={{alignItems: "stretch"}}
                    style={{width: "100%"}}
                    data={Object.values(recommendations)}
                    renderItem={({item}) => (
                        <View style={styles.button}>
                            <Button 
                                label={item.name.trim()}
                                onPress={()=>{handlePress(item)}}
                                onLongPress={()=>{handleLongPress(item)}}
                                />
                        </View>
                        
                    )}/>
                <LocationDetailsModal location={currentLocation?.name} isVisible={isModalVisible} onClose={onModalClose}>
                    <Text style={styles.text}>Address: {currentLocation?.address}</Text>
                    {locationDetails? 
                        <View>
                            <Text style={styles.text}> Phone Number: {locationDetails.phoneNumber}</Text>
                            <Text style={styles.text}> Website: {locationDetails.website} </Text>
                            <Text style={styles.text}> Cost: {locationDetails.priceLevel} </Text>
                            <Text style={styles.text}> Rating: {locationDetails.userRatingsTotal}</Text>
                            {locationDetails.openingHours?
                                <View> 
                                    {locationDetails.openingHours.weekdayText ?
                                    <View>
                                       <Text style={styles.text}>{locationDetails.openingHours.weekdayText[0]}</Text>
                                       <Text style={styles.text}>{locationDetails.openingHours.weekdayText[1]}</Text>
                                       <Text style={styles.text}>{locationDetails.openingHours.weekdayText[2]}</Text>
                                       <Text style={styles.text}>{locationDetails.openingHours.weekdayText[3]}</Text>
                                       <Text style={styles.text}>{locationDetails.openingHours.weekdayText[4]}</Text>
                                       <Text style={styles.text}>{locationDetails.openingHours.weekdayText[5]}</Text>
                                       <Text style={styles.text}>{locationDetails.openingHours.weekdayText[6]}</Text>
                                    </View> : null}
                                </View>
                                :null
                            }
                        </View>
                    : null}
                </LocationDetailsModal>
                <LocationEditModal
                    location={currentLocation?.name} isVisible={isEditVisible} onClose={onEditClose}> 
                    <Button label={"Delete Recommendation"} onPress={()=>{deletePlace(currentLocation)}}/>    
                </LocationEditModal>
                <Link style={styles.text}href='./notificationExample'>Notification Example</Link>
            </View>  
        </View> 
    )
}

const styles = StyleSheet.create({
    button: {
        alignSelf: 'center',
        color: '#ffff',
        fontSize: 18, 
        borderColor: '#ffff',
        borderWidth: 2, 
        borderRadius: 6,
        margin: 8, 
        width: '65%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        backgroundColor: '#25292e',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
      },
    header: {
        color: '#ffff',
        flex: 2, 
        fontSize: 20,
        fontWeight: 'bold',
        padding: 40, 
    },
    body: {
        width: '100%',
        flex: 25
    },
    text: {
        fontSize: 15, 
        color: '#ffff', 
        textAlign: 'center'
    }
})


