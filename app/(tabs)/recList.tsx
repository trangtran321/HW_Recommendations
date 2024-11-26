import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore, {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'; 

export default function RecList(){
    return (
        <View>
            <Text>List of Recommendations by City </Text>
        </View>
    )
}