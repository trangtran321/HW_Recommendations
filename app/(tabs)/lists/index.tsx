import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';

export default function Index(){

    return (
        <View style={styles.container}>
            <Text style={styles.text}>TO DO :: SHOW CITIES AND Route to that city's recommendation lists</Text>
            
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
    button: {
      fontSize: 20,
      textDecorationLine: 'underline',
      color: '#ffff',
    },
    logo_wrapper: {
      alignItems: 'center',
      padding: 30,
    }
  });