import React from 'react';
import { StyleSheet, View, Button, Image, TextInput, ScrollView, TouchableOpacity, Text } from 'react-native';
import { auth } from '../actions';
import { connect } from 'react-redux';
import { Spinner } from '../Spinner';
import AsyncStorage from '@react-native-community/async-storage';
import { version } from '../../package.json';
import RNFS from 'react-native-fs';
import moment from 'moment';

const IMG1 = require('../res/authentication.png');
const frame1 = require('../res/frame1.png');
const frame2 = require('../res/frame2.png');

class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user_token: '',
      srv_name: '',
      username: '',
      password: ''
    };
  }

  static getDerivedStateFromProps(props, state) {

    if (props.token) {
      const { navigate } = props.navigation;

      AsyncStorage.getItem('user_token')
        .then(token => {
          if (token) {
            AsyncStorage.setItem('limit_cmd', '200');
            AsyncStorage.setItem('limit_fac', '200');
            navigate('DownloadingData_clients');
          }
        })

      return { path: props.path };
    }
    else return null;
  }

  _OnLoginPressed() {
    const { username, password, srv_name } = this.state;
    console.log('******************************');    
    console.log('****   Authentification   ****');
    console.log('******************************');
    console.log('Serveur : ' + srv_name);
    console.log('Username : ' + username);
    console.log('Password : ' + password);
    console.log('==============================');
    let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Login : server:" + srv_name + ", username:" + username + ", password:" + password + "\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');

    this.props.auth({ username, password, srv_name });
    /*this.srv_name.clear();
    this.username.clear();
    this.password.clear();*/
  }

  support() {
    this.props.navigation.navigate('SupportLogin');
  }

  _renderButton() {
    if (this.props.loading) {
      return <Spinner />;
    }
    return (
      <TouchableOpacity onPress={this._OnLoginPressed.bind(this)} style={styles.SubmitButtonStyle} activeOpacity={.5}>
        <Text style={styles.TextStyle}>Authentification</Text>
      </TouchableOpacity>
    );
  }
  render() {

    return (

      <ScrollView contentContainerStyle={styles.containerMain} >
        <View style={styles.container}  >
          <Image style={styles.frame1} source={frame1} resizeMode="contain" resizeMethod="resize" />
          <Image style={styles.frame2} source={frame2} resizeMode="contain" resizeMethod="resize" />

          <Image style={styles.auth} source={IMG1} />
          <TextInput ref={input => { this.srv_name = input }} placeholder="Adresse du serveur" style={styles.inputs} returnKeyLabel={"next"}
            onChangeText={(text) => this.setState({ srv_name: text })} autoCapitalize='none' />

          <TextInput ref={input => { this.username = input }} placeholder="Nom d'utilisateur" style={styles.inputs} returnKeyLabel={"next"}
            onChangeText={(text) => this.setState({ username: text })} autoCapitalize='none' />

          <TextInput ref={input => { this.password = input }} placeholder="Mot de passe" style={styles.inputs} secureTextEntry={true} returnKeyLabel={"next"}
            onChangeText={(text) => this.setState({ password: text })} autoCapitalize='none' />


          {this._renderButton()}
          <Text style={styles.support} onPress={this.support.bind(this)}>Besoin d'aide ?</Text>
          <Text style={styles.error_msg}>{this.props.error}</Text>

        </View>
        <View style={styles.rad}></View>
        <View style={styles.footer}>
          <Text style={styles.TextStyle}>{'\n'}iSales Premium v {version} © Tous droits réservés - Développer par BDC</Text>
        </View>
      </ScrollView>
    );

  }

}
const mapStatetoPropos = state => {
  return {
    error: state.auth.error,
    loading: state.auth.loading,
    token: state.auth.token,
  }
}
export default connect(mapStatetoPropos, { auth })(Home);

const styles = StyleSheet.create({
  containerMain: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',

  },
  container: {
    marginTop: 20,
    marginBottom: 50,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  frame1: {
    width: 150,
    position: 'absolute',
    left: 0,
    opacity: 0.3,

  },
  frame2: {
    width: 150,
    position: 'absolute',
    right: 0,
    opacity: 0.3,
  },
  auth: {
    width: 250,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  inputs: {
    width: 300,
    height: 40,
    borderColor: '#00BFA6',
    borderWidth: 1,
    borderRadius: 25,
    textAlign: 'center',
    color: '#00BFA6',
    marginBottom: 5,

  },
  support: {
    marginTop: 15,
    color: '#00BFA6',
    marginBottom: 30,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  error_msg: {
    color: 'red',
  },
  SubmitButtonStyle: {
    marginTop: 10,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#00BFA6',
    borderRadius: 25,
    width: 300,
  },
  WaitingButtonStyle: {
    marginTop: 10,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    width: 300,
  },
  TextStyle: {
    color: '#fff',
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    height: 80,
    backgroundColor: '#00BFA6',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0,

  },
  rad: {
    width: '100%',
    height: 50,
    backgroundColor: '#ffffff',
    bottom: 0,
    marginBottom: 55,
    position: 'absolute',
    zIndex: 5,
    borderRadius: 25,
  }
});