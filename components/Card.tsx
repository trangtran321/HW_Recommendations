import { ExternalPathString, Link, RelativePathString, UnknownInputParams } from 'expo-router';
import React from 'react';
import {StyleSheet, View, Pressable, Text, Image, ImageSourcePropType} from 'react-native';

type Props={
    label: string;
    description?: string;
    imageSource?: ImageSourcePropType | undefined;
    onPress?: () => void;
}
export default function Card({label, description, imageSource, onPress}:Props){
    return(
        <View style={styles.card}>
                <Pressable style={styles.cardContent}
                    onPress={onPress}>
                    <Image source={imageSource}/>
                    <View style={styles.title}> 
                        <Text style={styles.buttonLabel}> {label} </Text>
                        {description? (<Text style={styles.description}> {description} </Text>) : (null)}
                    </View>   
                </Pressable>            
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: '#ffff',
        height: '80%',
        width: '80%',
        padding: 10,
        margin: 10,
        elevation: 3, 
        shadowOffset: {width: 1, height: 1},
        shadowColor: '#ffff',
        shadowOpacity: 0.3, 
    },
    cardContent: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0000', 
        overflow: 'hidden',
        flexDirection: 'column',
    },
    title: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0000',
        padding: 10, 
    },
    buttonLabel: {
        alignSelf: 'center',
        color: '#ffff',
        fontSize: 18, 
    },
    image: {
        alignSelf: 'center',
        height: 40,
        width: 40,
    },
    description: {
        color: '#ffff',
        fontSize: 16,
    }
})