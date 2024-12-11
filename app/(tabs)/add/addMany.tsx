import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, FlatList, Pressable } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { GooglePlaceData, GooglePlaceDetail, GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Button from '@/components/Button';
// import Icon from 'react-native-vector-icons/FontAwesome'; 
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';


export default function AddMany() {
    const user = auth().currentUser;
    const [text, setText] = useState<string | undefined>('');
    const [placeDetails, setPlaceDetails] = useState<{
        placeId: string | undefined,
        name: string | undefined,
        address: string | undefined,
        city: string | undefined,
        state: string | undefined,
        long: number | undefined,
        lat: number | undefined
    }>({
        placeId: '',
        name: '',
        address: '',
        city: '',
        state: '',
        long: 0,
        lat: 0
    });
    const [placeList, setPlaceList] = useState<FirebaseFirestoreTypes.DocumentData[]>([]);
    const [pendingPlaces, setPendingPlaces] = useState<Array<typeof placeDetails>>([]);

    const onPlaceSelected = (data: (GooglePlaceData | undefined), details: (GooglePlaceDetail | null)) => {
        //if nothing has been selected
        if (!data || !details) return;

        const addressComponents = details.address_components;
        let city = "";
        addressComponents.forEach((component) => {
            if (component.types.includes("locality") && component.types.includes("political")) {
                city = component.long_name;
            }
        });

        const placeData = {
            placeId: data.place_id,
            name: data.structured_formatting['main_text'],
            address: details.formatted_address || '',
            city: city,
            state: addressComponents[4].long_name,
            long: details.geometry.location.lng,
            lat: details.geometry.location.lat
        };

        //lists of places to be added
        if (!pendingPlaces.some(item => item.placeId === placeData.placeId)) {
            setPendingPlaces([...pendingPlaces, placeData]);
        }
        setPlaceDetails(placeData);
        setText(''); 
    };

    useEffect(() => {
        const fetchPlaces = async () => {
            if (user) {
                try {
                    const placesRef = firestore().collection("users").doc(user.uid);
                    const places = (await placesRef.collection("places").get()).docs.map(doc => doc.data());
                    setPlaceList(places);
                } catch (error) {
                    console.error("Error fetching places: ", error);
                }
            }
        };

        fetchPlaces();
    }, [user]);

    const addAllPendingPlacesToList = async () => {
        if (pendingPlaces.length === 0) {
            alert("There are no places to add.");
            return;
        }

        if (user) {
            try {
                const placesRef = firestore().collection("users").doc(user.uid);
                for (const place of pendingPlaces) {
                    //check for duplicates first
                    const isDuplicate = placeList.some(item => item.name === place.name && item.address === place.address);
                    if (!isDuplicate) {
                        await placesRef.collection("places").add(place);
                    }
                }

                alert(`All listed places below were added to your list.`);
                setPlaceList([...placeList, ...pendingPlaces]);
                setPendingPlaces([]);

            } catch (error) {
                console.error("Error adding listed places: ", error);
            }
        }
    };

    const removePlaceFromPending = (placeId: string|undefined) => {
        setPendingPlaces(pendingPlaces.filter((place) => place.placeId !== placeId));
    };

    return (
        <FlatList
            data={pendingPlaces}
            keyExtractor={(item, index) => item.placeId || index.toString()}
            ListHeaderComponent={
                
                <View style={styles.header}>
                    {/* <Stack.Screen options={{ headerShown: false }} />  */}
                    <Text style={styles.text}>Add Multiple Places</Text>
                    <View style={styles.autocompleteContainer}>
                        <GooglePlacesAutocomplete
                            placeholder="Search"
                            onPress={(data, details = null) => onPlaceSelected(data, details)}
                            fetchDetails={true}
                            query={{
                                key: 'AIzaSyCW-I4MKP209wKjAB3uq0KPb1wG92tgFQE',
                                language: 'en',
                            }}
                            
                        />
                    </View>
                    <TouchableOpacity style={styles.customButton} onPress={addAllPendingPlacesToList}>
                        <Text style={styles.customButtonText}>Add The Places Below To My List</Text>
                    </TouchableOpacity>
                    <Text style={styles.text2}>Places To Be Added: </Text>
                </View>
            }
        
            renderItem={({ item }) => (
                <View style={styles.placeItem}>
                    <View style={styles.placeTextContainer}>
                        <Text style={styles.placeName}>{item.name}</Text>
                        <Text style={styles.placeAddress}>{item.address}</Text>
                    </View>
                    <Pressable onPress={()=>removePlaceFromPending(item.placeId)}>
                        <Ionicons name="trash" size={24} color="red"/>
                    </Pressable>
                </View>
            )}
            style={styles.placeListContainer}
            contentContainerStyle={{ backgroundColor: '#25292e', paddingBottom: 20 }}
        />
    );
}
const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        backgroundColor: '#25292e',
    },
    container: {
        flexGrow: 1,
        backgroundColor: '#25292e',
        alignItems: 'center',
        // justifyContent: 'flex-start',
        // width: '100%',
        paddingBottom: 20,
    },
    autocompleteContainer: {
        // zIndex: 10,
        width: '70%',
        flex: 1, 
        marginTop: 20,
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
        // marginTop: -10,
    },
    placeListContainer: {
        width: '100%',
        flex:1,
        backgroundColor: '#25292e'
        // marginTop: 20,
    },
    placeItem: {
        backgroundColor: '#444',
        marginBottom: 10,
        margin:20,
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    placeTextContainer: {
        flex: 1,
        width: '100%',
        // justifyContent: 'center',
    },
    placeName: {
        color: '#fff',
        fontWeight: 'bold',
        // marginBottom: 5,
    },
    placeAddress: {
        color: '#fff',
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
});