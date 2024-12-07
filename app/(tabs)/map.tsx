import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, Modal, Pressable } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import MapView, { PROVIDER_GOOGLE, Region, Marker } from 'react-native-maps'; 
import * as Location from 'expo-location';
// import { useLocation } from '@/utils/locationContext';

// TODO:: 
// 1. Put pins on map taken from Firestore
// 2. Decide if we want to use google maps - if so, need to use PROVIDER_GOOGLE in MAPVIEW.
// 3. Functionality to zoom into map and click on pin to show modal giving quick-view of location

// //add provider={PROVIDER_GOOGLE} to <MapView> 
// const INITAL_REGION = {
//   latitude: 37.33,
//   longitude: -122,
//   latitudeDelta: 2,
//   longitudeDelta: 2
// }

// Add interface after imports
interface Place {
  id: string;
  name: string;
  latitude: number;  // This will come from 'lattitude' in Firestore
  longitude: number;
  description?: string;  // This will come from 'address' in Firestore
  city?: string;
  state?: string;
}

export default function Map(){
  const user = auth().currentUser; 
  
  //const [currentRegion, setCurrentRegion] = useState<Region | undefined>();
  const [currentRegion, setCurrentRegion] = useState<Region>({
    latitude: 31.7619, // Las Cruces default coordinates
    longitude: -106.4850,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });
  const [locations, setLocations] = useState<Place[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Place | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const zoomIn = () => {
    if (currentRegion) {
      const newRegion = {
        ...currentRegion,
        latitudeDelta: currentRegion.latitudeDelta / 2,
        longitudeDelta: currentRegion.longitudeDelta / 2,
      };
      setCurrentRegion(newRegion);
    }
  };

  const zoomOut = () => {
    if (currentRegion) {
      const newRegion = {
        ...currentRegion,
        latitudeDelta: currentRegion.latitudeDelta * 2,
        longitudeDelta: currentRegion.longitudeDelta * 2,
      };
      setCurrentRegion(newRegion);
    }
  };

  //Get permission to track user and get current location 
  useEffect(() => {
    async function getCurrentLocation() {
      try {
        let { status } = await Location.requestBackgroundPermissionsAsync();
        if (status !== 'granted') {
          alert("Permission to access location was denied")
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        console.log(JSON.stringify(location));

        setCurrentRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5
        });
      } catch (error) {
        console.log("Error getting location:", error);
      }
    }
    getCurrentLocation();
  }, []);

  // useEffect(() => {
  //   const fetchLocations = async () => {
  //     try {
  //       console.log("Fetching locations...");
  //       const user = auth().currentUser;
        
  //       if (!user) {
  //         console.log("No user logged in");
  //         return;
  //       }
        
  //       console.log("User ID:", user.uid);
        
  //       const snapshot = await firestore()
  //         .collection('users')
  //         .doc(user.uid)
  //         .collection('places')
  //         .get();
        
  //       console.log("Raw Firestore data:", snapshot.docs.map(doc => doc.data()));
  //       console.log("Number of locations found:", snapshot.size);

  //       if (snapshot.empty) {
  //         console.log("No locations found in Firestore");
  //         return;
  //       }

  //       const locationData = snapshot.docs.map(doc => {
  //         const data = doc.data();
  //         console.log("Location data:", data);

  //         if (!data.lattitude || !data.longitude) {
  //           console.log("Missing coordinates for location:", data.name);
  //           return null;
  //         }

  //         return {
  //           id: doc.id,
  //           name: data.name || 'Unnamed Location',
  //           latitude: Number(data.lattitude), // Note the spelling from your data structure
  //           longitude: Number(data.longitude),
  //           description: data.address || '',
  //           city: data.city,
  //           state: data.state
  //         };
  //       }).filter(location => location !== null);
        
  //       console.log("Processed locations:", locationData);
  //       setLocations(locationData);
  //     } catch (error) {
  //       console.error('Error loading locations:', error);
  //     }
  //   };

  //   fetchLocations();
  // }, []);
  
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const user = auth().currentUser;
        console.log("Current user: " , user);
  
        if (!user) {
          console.log("No user login");
          return;
        }

        console.log("Fetching locations for user:", user.uid);

        const snapshot = await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('places')
          .get();
        
        //console.log("Snapshot empty:", snapshot.empty);
        
        if (snapshot.empty) {
          console.log("No locations found in Firestore");
          return;
        }
        
        // Log each document's data
        // snapshot.docs.forEach(doc => {
        //   console.log("Document ID:", doc.id);
        //   console.log("Document data:", doc.data());
        // });

        const locationData: Place[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unnamed Location',
            latitude: data.lat,  // Ensure this matches your Firestore field
            longitude: data.long,  // Ensure this matches your Firestore field
            description: data.address || '',
            city: data.city,
            state: data.state
          };
        }).filter(data => data.latitude && data.longitude); // Ensure latitude and longitude exist
        
         // Add the console log here
        console.log("Processed locations:", locationData);
        
        setLocations(locationData);
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    };
  
    fetchLocations();
  }, []);
  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        region={currentRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onRegionChangeComplete={(region) => setCurrentRegion(region)}
      >
        {locations.map(location => (
          //console.log("Rendering marker for:", location);
            <Marker
              key={location.id}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude
              }}
              title={location.name}
              description={location.description}
              onPress={() => {
                setSelectedLocation(location);
                setModalVisible(true);
              }}
            />
        ))}
      </MapView>
        
      {/* Zoom Controls - moved after MapView */}
      <View style={[styles.zoomControls, {pointerEvents: 'box-none'}]}>
        <Pressable 
          style={[styles.zoomButton, { pointerEvents: 'auto' }]} 
          onPress={zoomIn}
          //android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
        >
          <Text style={styles.zoomButtonText}>+</Text>
        </Pressable>
        <Pressable 
          style={[styles.zoomButton, { pointerEvents: 'auto' }]} 
          onPress={zoomOut}
          //android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
        >
          <Text style={styles.zoomButtonText}>-</Text>
        </Pressable>
    </View>
        
    {/* Location Details Modal */}
    {selectedLocation && (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedLocation.name}</Text>
            <Text style={styles.modalText}>{selectedLocation.description}</Text>
              {selectedLocation.city && (
                <Text style={styles.modalText}>{selectedLocation.city}, {selectedLocation.state}</Text>
            )}
            <Pressable
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    )}
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#25292e',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    backgroundColor: 'transparent',
    zIndex: 999,
    elevation: 999,
    width: 40,
  },
  zoomButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  zoomButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#666',
  },
});

