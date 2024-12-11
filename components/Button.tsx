import { ReactNode } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';


type Props={
    label: string;
    onPress? : () => void;
    onLongPress?: () => void;
    children?: ReactNode; 
}

export default function Button({label, onPress, children, onLongPress}:Props){
    return (
            <Pressable 
                onPress={onPress}
                onLongPress={onLongPress}>
                <Text style={styles.buttonLabel}> {label} </Text>
                {children}
            </Pressable>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: 320, 
        height: 68, 
        marginHorizontal: 20, 
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2, 
    },
    button: {
        borderRadius: 10,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonLabel: {
        color: '#ffff',
        fontSize: 16, 
    }
})