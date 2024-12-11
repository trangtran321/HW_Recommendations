import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Button from '../../components/Button';

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


export default function Profile() {
    const user = auth().currentUser;
    const [placeCount, setPlaceCount] = useState<number>(0);
    const [cityCount, setCityCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const handleLogout = async () => {
        try {
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
            await auth().signOut();
            alert("You are signed out");
            
        } catch (error) {
            console.error("Logout Error:", error);
            alert("Failed to sign out. Please try again.");
        }
        router.replace('/');
    };

    useEffect(() => {
        if (!user) return;

        const placesRef = firestore()
            .collection('users')
            .doc(user.uid)
            .collection('places');

        //count the number of cities and places the user has saved and display
        const unsubscribe = placesRef.onSnapshot(
            (snapshot) => {
                const places = snapshot.docs.map(doc => doc.data());

                setPlaceCount(places.length);
                const cities = new Set<string>();
                places.forEach(place => {
                    if (place.city) cities.add(place.city);
                });

                setCityCount(cities.size);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching real-time updates:", error);
                alert("Failed to fetch updates.");
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [user]);

    return (
        <View style={styles.container}>
            <Image 
                source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
                style={styles.profileImage}
            />
            <Text style={styles.greeting}>Welcome, {user?.displayName || "User"}!</Text>
            <Text style={styles.email}>{user?.email}</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#ffffff" />
            ) : (
                <View style={styles.statsContainer}>
                    <Text style={styles.info}>
                        {placeCount === 0
                            ? "You haven't saved any places yet. Start exploring and save your favorites!"
                            : `You have saved ${placeCount} place${placeCount > 1 ? 's' : ''}.`}
                    </Text>
                    {placeCount > 0 && (
                        <Text style={styles.info}>
                            Cities saved: {cityCount}.
                        </Text>
                    )}
                </View>
            )}
            <NotificationService />
            <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
                <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    greeting: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 5,
    },
    email: {
        fontSize: 14,
        color: '#ffffff',
        marginBottom: 20,
    },
    statsContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    info: {
        fontSize: 16,
        color: '#ffffff',
        marginBottom: 5,
        textAlign: 'center',
    },
    actionButton: {
        backgroundColor: '#ffd33d',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    buttonText: {
        fontSize: 16,
        color: '#25292e',
    },
});
