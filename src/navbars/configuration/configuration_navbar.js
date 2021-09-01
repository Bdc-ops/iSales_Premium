import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-community/async-storage';
import CardView from 'react-native-cardview';

const IMG1 = require('../../res/bg1.jpg');
const LOGO = require('../../res/logo_signe.png');

class Configuration_navbar extends React.Component {
  _logout() {
    AsyncStorage.removeItem('user_token');
    AsyncStorage.removeItem('serv_name');
  }
  back() {
    this.props.title('Dashboard');
  }
  render() {
    return (
      <View>
        <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#00BFA6', '#0CD1AF', '#0CD1AF', '#29FCC4']} style={styles.container}>
          <Image source={IMG1} style={styles.image}></Image>

          <CardView style={styles.stats} cardElevation={20} cornerRadius={75}>
            <Image style={styles.logo} source={LOGO} />
          </CardView>
          <TouchableOpacity style={styles.SubmitButtonStyleHome} activeOpacity={.5}
            onPress={() => { this.back() }}>
            <Icon name="arrow-left" size={20} style={styles.iconHome} />
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.containerBottom}></View>


      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  logo: {
    width: 130,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  stats: {
    backgroundColor: '#ffffff',
    width: 150,
    height: 150,
    position: 'absolute',
    top: 140,
    alignItems: 'center',
  },
  icon1: {
    color: '#ffffff',
    alignItems: 'flex-end',

    position: 'absolute',
    right: 20,
    top: 20,

  },
  containerBottom: {
    backgroundColor: '#ffffff',
    height: 40,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    marginTop: -80,
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
    left: 10,
    top: 90,
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
  SubmitButtonStyleSearch: {
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
  SubmitButtonStylePanier: {
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
  iconPanier: {
    color: '#00BFA6',
    alignItems: 'flex-end'
  },
  SubmitButtonStyleSync: {
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
  }

});

export default Configuration_navbar;