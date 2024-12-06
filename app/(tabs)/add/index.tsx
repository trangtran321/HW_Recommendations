import { View, StyleSheet, Text } from 'react-native';
import Button from '@/components/Button';
import { router } from 'expo-router';

//TODO: 
//    1.UI/UX to make buttons more pleasing and clear that they are buttons. 
//    2.Ensure that the tab will only ever navigate to this screen and not the other screens. Currently, if 
//      if you enter  onto this screen via tab, click either add one or add many button, click to another tab, 
//      and click the 'Add' tab again it will not open the index file, but will open the add one or add many file. 

export default function Index(){
  const navigateToOne = async () => {
    router.navigate("/(tabs)/add/addOne");
  }

  const navigateToMany = async () => {
    router.navigate("/(tabs)/add/addMany");
  }
    return (
        <View style={styles.container}>
            <Text style={styles.text}>How many recommendations would you like to add? </Text>
            <Button 
                label={"One Recommendation"}
                onPress={navigateToOne}/> 
            <Button
                label={"Multiple Recommendations"}
                onPress={navigateToMany}/>
            
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