import { useEffect, useState} from 'react';
import { View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore, {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import { GooglePlaceData, GooglePlaceDetail, GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'; 
import Button from '@/components/Button';
import { Stack } from 'expo-router';


//TODO:: - Just UI/UX for this page. I think all functionality is done.


export default function AddOne(){
    const user = auth().currentUser; 
    const [text, setText] = useState<string|undefined>('');
    const [place, setPlace] = useState<string | undefined>();
    const [placeDetails, setPlaceDetails] = useState<{
                placeId: string | undefined,
                name: string | undefined,
                address: string | undefined, 
                city: string | undefined,
                state: string | undefined,
                long: number | undefined,
                lat: number | undefined
              }>({placeId: '', name: '', address: '', city: '', state: '', long: 0, lat: 0});
    const [placeList, setPlaceList] = useState<FirebaseFirestoreTypes.DocumentData[]>([]); 

    const onPlaceSelected = (data: (GooglePlaceData | undefined), details: (GooglePlaceDetail | null)) => {
        //if nothing has been selected
        if (!data || !details) return; 

        const addressComponents = details.address_components
        let city = ""; 
        addressComponents.forEach((component)=>{
            if (component.types.includes("locality") && component.types.includes("political")){
                city = component.long_name;
                console.log(component.long_name);
            }
            
        })
        
        const placeData = { 
            placeId: data.place_id,
            name: data.structured_formatting['main_text'],
            address: details.formatted_address || '',
            city: city,
            state: addressComponents[4].long_name,
            long: details.geometry.location.lng,
            lat: details.geometry.location.lat
        }
        const placeId = data.place_id;
        console.log(placeData.name, placeId, placeData.address, placeData.lat, placeData.long, placeData.city, placeData.state)
        setPlaceDetails(placeData); 
        setPlace(placeData.name); 
        setText(placeData.name)
    }

    useEffect (() => {
        //Get user's places
        const fetchPlaces = async () => {
            if(user) {
                try {
                    const placesRef = firestore().collection("users").doc(user.uid);
                    const places = (await placesRef.collection("places").get()).docs.map(doc => doc.data());
                    setPlaceList(places);
                }catch (error){
                    console.error("Error fetching places: ", error);
                }
            }
        }

        fetchPlaces();
    }, [user])

    const addPlaceToList = async () => {
        if (placeDetails.name && user){
            const isDuplicate = placeList.some(item=> item.name === placeDetails.name && item.address == placeDetails.address); 

            if (isDuplicate){
                alert("This place has already been added to your list."); //we can change this instead of being an 'alert'
                return;
            }

            try { 
                const placesRef = firestore().collection("users").doc(user.uid);
                const places = (await placesRef.collection("places").add(placeDetails));
                alert(`This place was added to your ${placeDetails.city} list.`)
                setPlaceList([...placeList, placeDetails]);
                setPlace('');
                setPlaceDetails({placeId: '', name: '', address: '', city: '', state: '', long: 0, lat: 0});
                return; 
            } catch (error){
                console.error("Error adding document: ", error);
            }
        } else {
            if (!user) {
                alert("User not logged in.");
            }
            if (!placeDetails.name){
                alert("The place is missing details.")
            }
            alert("User not logged in or place details are missing."); 
        }
    }
    return (
        <View style={styles.container}>
            {/* <Stack.Screen options={{ headerShown: false }} /> uncomment this to remove header, would need to add a back button */}
            <Text style={styles.text}>Add a Place</Text>
            <View style={{zIndex: 1, flex: 0.5, width: '70%', marginTop: 15}}>
                <GooglePlacesAutocomplete
                    placeholder='Search'
                    onPress={(data, details = null) => {
                        onPlaceSelected(data, details)
                    }} 
                    fetchDetails={true}
                    query={{
                        key: 'AIzaSyBos1E_9ZLoq8C7A9RoMBYgOEpjfcrBf3g',
                        language: 'en'
                    }}
                    onFail={error => console.log(error)}
                />
            </View>
            <TouchableOpacity style={styles.customButton} onPress={addPlaceToList}>
                <Text style={styles.customButtonText}>Add The Place To My List</Text>
            </TouchableOpacity>
            <Text style={styles.text2}> 
                {text}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1, 
            backgroundColor: '#25292e',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%'
        },
        input: {
            height: 40, 
            width: '50%',
            borderColor: '#ffff',
            borderWidth: 1,
            padding: 10,
            margin: 10,
            color: '#ffff'
        },
        text: {
            color: '#ffff',
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            padding: 30,
            margin: 20,
        },
        text2: {
        color: '#ffff',
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 30,
        marginTop: -10,
        },
        customButton: {
            backgroundColor: '#ffd33d',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 30,
            marginTop: 20,
            width: '70%',
            alignItems: 'center',
            marginBottom: 20,
        },
        customButtonText: {
            color: '#25292e',
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center'
        },
    }
)