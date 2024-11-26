import { View, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router'; 

export default function NotFoundScreen(){
    return(
        <>
            <Stack.Screen options={{title: 'Ooops! Not Found'}}/>
            <View style = {styles.container}> 
                <Link href="/" style={styles.button}>
                    Go back to homescreen. 
                </Link>
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
      },
  });