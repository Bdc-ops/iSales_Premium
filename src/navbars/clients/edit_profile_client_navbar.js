import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
const avatar_image = require('../../res/profile2.png');

class Client_Edit_navbar extends React.Component {
  back() {
    this.props.title('ShowClient');
  }
  render() {
    return (
      <View>
        <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#00BFA6', '#0CD1AF', '#0CD1AF', '#29FCC4']} style={styles.container}>
          <TouchableOpacity style={styles.SubmitButtonStyleHome} activeOpacity={.5}
            onPress={() => { this.back() }}>
            <Icon name="arrow-left" size={20} style={styles.iconHome} />
          </TouchableOpacity>
          <Image style={styles.circle} source={avatar_image} />
        </LinearGradient>
        <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#00BFA6', '#0CD1AF', '#0CD1AF', '#29FCC4']} style={styles.containerBottomBackground}></LinearGradient>
        <View style={styles.containerBottom}></View>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 30,
    paddingRight: 30,

  },
  containerBottom: {
    backgroundColor: '#ffffff',
    height: 40,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    marginTop: -40,
    zIndex: 5,
  },
  containerBottomBackground: {
    height: 40,

  },
  SubmitButtonStyleHome: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    width: 40,
    height: 40,
    position: 'absolute',
    left: 10
  },
  SubmitButtonStyleBack: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    width: 40,
    height: 40,
    position: 'absolute',
    left: 60
  },
  SubmitButtonStyleedit: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    width: 40,
    height: 40,
    position: 'absolute',
    right: 60
  },
  SubmitButtonStyledel: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    width: 40,
    height: 40,
    position: 'absolute',
    right: 10
  },
  icons: {
    color: '#00BFA6',
    alignItems: 'flex-end'
  },
  iconHome: {
    color: '#CED4DA',
    alignItems: 'flex-end'
  },
  circle: {

    alignItems: 'center',
    width: 260,
    height: 170,
    position: 'absolute',
    top: 20,
  },

});

export default Client_Edit_navbar;