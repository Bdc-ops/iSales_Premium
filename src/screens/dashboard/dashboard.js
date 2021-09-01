import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, ScrollView, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import Dashboard_navbar from '../../navbars/dashboard/dashboard_navbar';
import LinearGradient from 'react-native-linear-gradient';
import { version } from '../../../package.json';
import RNFS from 'react-native-fs';
import moment from 'moment';
const button_model_c = require('../../res/button_model_c.png');
const button_model_p = require('../../res/button_model_p.png');
const button_model_pa = require('../../res/button_model_pa.png');
const button_model_f = require('../../res/button_model_f.png');
const button_model_f_disable = require('../../res/button_model_f_disable.png');
const button_model_s = require('../../res/button_model_s.png');
const button_model_cmd = require('../../res/button_model_cmd.png');


export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      count_client: 0,
      count_commandes: 0,
      count_produits: [],
      count_categories: [],
      token: '',
    };
  }

  componentDidMount() {
    let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Dashboard\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    this._isMounted = true;
    AsyncStorage.getItem('user_token')
      .then(token => {
        this.setState({
          token: token
        })
      });
  }
  componentWillMount() {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  _logout() {
    AsyncStorage.removeItem('user_token');
    AsyncStorage.removeItem('serv_name');
    this.props.navigation.navigate('Login');
  }



  /*
    _del() {
  
      const filePath1 = RNBackgroundDownloader.directories.documents + "/iSales_3/";
  
  
      return RNFS.unlink(filePath1)
        .then(() => {
          console.log('FILE DELETED');
        })
        .catch((err) => {
          console.log(err.message);
        });
  
    }
  
    _check() {
  
  
      AsyncStorage.getItem('user_token')
        .then(token => {
  
          AsyncStorage.getItem('serv_name')
            .then(server => {
              Download_Produits_Images();
            })
        })
    }
  
   async show() {
  
      console.log('####################################');
      db.transaction(tx => {
        tx.executeSql(`SELECT cc.*,(SELECT count(*) FROM commandes_client where isnew=1) as count,(SELECT * FROM produits where produits.ref=cc.ref_produit) as produits FROM commandes_produits cc`, [], (tx, results) => {
          for (let i = 0; i < results.rows.length; ++i) {
            console.log(results.rows.item(i));
  
          }
        });
      });
    }*/

  _clients() {
    this.props.navigation.navigate('Clients', { token: this.state.token });
  }

  _produits() {
    this.props.navigation.navigate('Categories', { token: this.state.token });
  }
  _commandes() {
    this.props.navigation.navigate('Commandes', { token: this.state.token });
  }
  _panier() {
    this.props.navigation.navigate('Panier_', { token: this.state.token });
  }
  _statistiques() {
    this.props.navigation.navigate('Statistiques', { token: this.state.token });
  }
  a_propos() {
    this.props.navigation.navigate('A_propos');
  }

  _factures() {
    this.props.navigation.navigate('Factures', { token: this.state.token });
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <ScrollView contentContainerStyle={styles.containerMain} ref='_scrollView'>

        <Dashboard_navbar title={navigate}></Dashboard_navbar>
        <View style={styles.container}>
          <View style={styles.containerResults}>
            <View style={styles.buttonscontrole}>

              <View style={{ marginBottom: -40 }}>
                <TouchableOpacity onPress={this._clients.bind(this)}>
                  <ImageBackground style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }} source={button_model_c}>
                    {/*<Icon name="users" size={50} style={{ color: '#000000', marginBottom: 5 }} /> */}
                    <Text style={{ paddingTop: 100, fontWeight: 'bold' }}>Clients</Text>
                  </ImageBackground>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={this._produits.bind(this)}>
                  <ImageBackground style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }} source={button_model_p}>
                    {/*<Icon name="boxes" size={50} style={{ color: '#00BFA6', marginBottom: 5 }} /> */}
                    <Text style={{ paddingTop: 100, fontWeight: 'bold' }}>Produits</Text>
                  </ImageBackground>
                </TouchableOpacity>
                <TouchableOpacity onPress={this._panier.bind(this)}>
                  <ImageBackground style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }} source={button_model_pa}>
                    {/*<Icon name="shopping-cart" size={50} style={{ color: '#00BFA6', marginBottom: 5 }} />*/}
                    <Text style={{ paddingTop: 100, fontWeight: 'bold' }}>Panier</Text>
                  </ImageBackground>
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: -40, flexDirection: 'row' }}>
                <TouchableOpacity onPress={this._commandes.bind(this)}>
                  <ImageBackground style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }} source={button_model_cmd}>
                    {/*<Icon name="scroll" size={50} style={{ color: '#00BFA6', marginBottom: 5 }} />*/}
                    <Text style={{ paddingTop: 100, fontWeight: 'bold' }}>Commandes</Text>
                  </ImageBackground>
                </TouchableOpacity>

                <TouchableOpacity onPress={this._factures.bind(this)}>
                  <ImageBackground style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }} source={button_model_f}>
                    {/*<Icon name="file-contract" size={50} style={{ color: '#00BFA6', marginBottom: 5 }} />*/}
                    <Text style={{ paddingTop: 100, fontWeight: 'bold' }}>Factures</Text>
                  </ImageBackground>
                </TouchableOpacity>

                <TouchableOpacity onPress={this._statistiques.bind(this)}>
                  <ImageBackground style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }} source={button_model_s}>
                    {/*<Icon name="chart-line" size={50} style={{ color: '#00BFA6', marginBottom: 5 }} />*/}
                    <Text style={{ paddingTop: 100, fontWeight: 'bold' }}>Statistiques</Text>
                  </ImageBackground>
                </TouchableOpacity>

              </View>
            </View>
          </View>
        </View>

        <View style={styles.rad}></View>
        <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#00BFA6', '#0CD1AF', '#0CD1AF', '#29FCC4']} style={styles.footer}>
          <Text style={styles.TextStyle}>{'\n'}iSales Premium v {version} © Tous droits réservés - Développer par BDC</Text>
        </LinearGradient>
      </ScrollView >
    );
  }
}




const styles = StyleSheet.create({
  containerMain: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    flexDirection: 'column',
  },
  containerResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'

  },


  img_buttons: {
    width: 160,
    height: 110,
    backgroundColor: 'red',
    position: 'absolute',
    right: 20
  },
  txt_buttons: {
    marginLeft: -80,
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
    color: '#00BFA6'
  },
  navigationContainer: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#fff",
    padding: 8
  },
  TextStyle: {
    color: '#fff',
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    height: 80,
    //backgroundColor: '#00BFA6',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0,

  },
  rad: {
    width: '100%',
    height: 80,
    backgroundColor: '#ffffff',
    bottom: 0,
    marginBottom: 45,
    position: 'absolute',
    zIndex: 5,
    borderRadius: 80,
  },
  buttonsleft: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  state_right: {
    width: '50%',
    marginLeft: 20
  },
  state_left: {
    width: '50%',
  },
  stat: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  OptionsButtonStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    width: 300,
  },

  icon1: {
    color: '#00BFA6',
    alignItems: 'flex-end'
  },
  iconButtons: {
    marginBottom: 10,
    fontSize: 30,
    color: '#00BFA6',
  },
  iconButtons_center: {
    marginBottom: 10,
    fontSize: 50,
    color: '#ffffff',
  },
  statistics: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  data_img: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img_stat: {
    width: 300,
    height: 220,
    //marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    width: 120,
    height: 30,
    margin: 5,
  },
  buttonscontrole: {
    //flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
    marginBottom: 50,
    marginTop: 50,
  },
  home_bg: {
    width: '100%',
    height: '100%'
  },
  buttonsview: {
    width: '50%',
    paddingLeft: 50,
    height: 550,
    paddingTop: 0,
  },
  messageview: {
    flexDirection: 'row',
    paddingTop: 10,
    alignItems: 'center',
    marginTop: 30,
    justifyContent: 'center',
    width: '100%',

  },
  text_stats: {
    //color: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesCount: {
    color: '#ffffff',
    fontSize: 15,
  },
  Buttonscommande: {
    borderWidth: 1,
    borderColor: '#00BFA6',
    width: 250,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    margin: 10,
  },

});