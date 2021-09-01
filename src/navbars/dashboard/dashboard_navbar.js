import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, BackHandler, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-community/async-storage';
import CardView from 'react-native-cardview';
import RNFS from 'react-native-fs';
import moment from 'moment';
const IMG1 = require('../../res/banner2.png');
const LOGO = require('../../res/logo_signe.png');

class Dashboard_navbar extends React.Component {


  _logout_action() {
    AsyncStorage.removeItem('user_token')
      .then(result => {
        AsyncStorage.removeItem('serv_name')
          .then(result => {
            BackHandler.exitApp();
            let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Demande de deconnection de l\'application \n-------";
            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
          });
      });


  }

  support() {
    this.props.title('Support');
  }

  _logout() {

    Alert.alert(
      "IMPORTANT",
      "Voulez-vous vraiment se déconnecter de l'application .",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Confirmer", onPress: () => this._logout_action()
        }
      ],
      { cancelable: false }
    );
  }

  config() {
    this.props.title('Configuration');
    console.log('here');

  }
  render() {
    return (

      <View>
        <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#00BFA6', '#0CD1AF', '#0CD1AF', '#29FCC4']} style={styles.container}>

          <Image source={IMG1} style={styles.image}></Image>

          <CardView style={styles.stats} cardElevation={20} cornerRadius={75}>
            <Image style={styles.logo} source={LOGO} />
          </CardView>



          <Icon name="power-off" onPress={this._logout.bind(this)} size={25} style={styles.icon1} />
          <Icon name="headset" onPress={this.support.bind(this)} size={25} style={styles.icon2} />
          <Icon name="cog" onPress={this.config.bind(this)} size={25} style={styles.icon3} />


        </LinearGradient>
        <View style={styles.containerBottom}></View>


      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 250,
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
    top: 95,
    alignItems: 'center',
  },
  icon1: {
    color: '#ffffff',
    alignItems: 'flex-end',

    position: 'absolute',
    right: 20,
    top: 20,

  },
  icon2: {
    color: '#ffffff',
    alignItems: 'flex-end',
    position: 'absolute',
    left: 20,
    top: 20,
  },
  icon3: {
    color: '#ffffff',
    alignItems: 'flex-end',
    position: 'absolute',
    left: 70,
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

export default Dashboard_navbar;