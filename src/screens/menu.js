import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Alert, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-community/async-storage';
import RNFS from 'react-native-fs';
import moment from 'moment';
var { width, height } = Dimensions.get('window');

const IMG1 = require('../res/banner2.png');


export default class menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      username: '',
      serv_name: '',
    };
    AsyncStorage.getItem('user_token')
      .then(token => {
        AsyncStorage.getItem('societe')
          .then(societe => {
            AsyncStorage.getItem('username')
              .then(username => {

                this.setState({
                  token: token,
                  username: username,
                  societe: societe
                })
              });
          });
      });

  }


  _commandes() { this.props.title('Commandes', { token: this.state.token }); }
  _clients() { this.props.title('Clients', { token: this.state.token }); }
  _produits() { this.props.title('ShowAllProduits', { token: this.state.token }); }
  _categories() { this.props.title('Categories', { token: this.state.token }); }
  _panier() { this.props.title('Panier_', { token: this.state.token }); }
  a_propos() { this.props.title('A_propos'); }
  _dashboard() { this.props.title('Dashboard'); }
  _statistiques() { this.props.title('Statistiques'); }
  _factures() { this.props.title('Factures'); }
  _support() { this.props.title('Support'); }
  _config(){ this.props.title('Configuration'); }

  _logout_action() {
    let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Demande de deconnection de l\'application \n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
    AsyncStorage.removeItem('user_token')
      .then(result => {
        AsyncStorage.removeItem('serv_name')
          .then(result => {
            BackHandler.exitApp();
          });
      });
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
  Capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  render() {

    return (



      <View backgroundColor='red' tyle={{ height: '100%' }}>
        <View style={{ height: 200 }}>
          <Image source={IMG1} style={Styles.img}></Image>
          <Icon name="power-off" onPress={this._logout.bind(this)} size={25} style={Styles.icon1} />
          <Text style={Styles.header_usr}><Icon name="user" size={18} color='#ffffff' /> {this.Capitalize(this.state.username)} - {this.state.societe}</Text>
        </View>
        <ScrollView>
          <View height={450} backgroundColor='#ffffff'>
            <TouchableOpacity style={Styles.items} onPress={this._dashboard.bind(this)}>
              <Icon name="home" size={20} color='#00BFA6' />
              <Text style={Styles.itemsList}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={Styles.items} onPress={this._clients.bind(this)}>
              <Icon name="users" size={20} color='#00BFA6' />
              <Text style={Styles.itemsList}>Clients</Text>
            </TouchableOpacity>
            <TouchableOpacity style={Styles.items} onPress={this._categories.bind(this)}>
              <Icon name="book-open" size={20} color='#00BFA6' />
              <Text style={Styles.itemsList}>Catalogue des produits</Text>
            </TouchableOpacity>
            <TouchableOpacity style={Styles.items} onPress={this._produits.bind(this)}>
              <Icon name="boxes" size={20} color='#00BFA6' />
              <Text style={Styles.itemsList}>Produits</Text>
            </TouchableOpacity>
            <TouchableOpacity style={Styles.items} onPress={this._commandes.bind(this)}>
              <Icon name="scroll" size={20} color='#00BFA6' />
              <Text style={Styles.itemsList}>Commandes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={Styles.items} onPress={this._factures.bind(this)}>
              <Icon name="file-contract" size={20} color='#00BFA6' />
              <Text style={Styles.itemsList}>Factures</Text>
            </TouchableOpacity>
            <TouchableOpacity style={Styles.items} onPress={this._statistiques.bind(this)}>
              <Icon name="chart-line" size={20} color='#00BFA6' />
              <Text style={Styles.itemsList}>Statistiques</Text>
            </TouchableOpacity>
            <TouchableOpacity style={Styles.items} onPress={this._panier.bind(this)}>
              <Icon name="shopping-cart" size={20} color='#00BFA6' />
              <Text style={Styles.itemsList}>Panier</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={Styles.items} onPress={this._config.bind(this)}>
              <Icon name="cog" size={20} color='#00BFA6' />
              <Text style={Styles.itemsList}>Configuration</Text>
            </TouchableOpacity>
            <TouchableOpacity style={Styles.items} onPress={this._support.bind(this)}>
              <Icon name="headset" size={20} color='#00BFA6' />
              <Text style={Styles.itemsList}>Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={Styles.items} onPress={this.a_propos.bind(this)}>
              <Icon name="life-ring" size={20} color='#00BFA6' />
              <Text style={Styles.itemsList}>A propos</Text>
            </TouchableOpacity>
          </View>
          <View style={Styles.copyright}>
            <Text style={Styles.TextStyle}>iSales © Tous droits réservés - Développer par BDC</Text>
          </View>
        </ScrollView>
      </View>


    );
  }
}


const Styles = StyleSheet.create({
  items: {
    flexDirection: 'row',
    margin: 10,
    marginLeft: 20
  },
  itemsList: {
    marginLeft: 20,
  },
  img: {
    width: '100%',
    height: 300,
  },
  TextStyle: {
    color: '#00BFA6',
    position: 'absolute',
    bottom: 0,
  },
  copyright: {
    height: height - 660,
    backgroundColor: '#ffffff',
    alignContent: 'center',
    alignItems: 'center',
  },
  icon1: {
    color: '#ffffff',
    alignItems: 'flex-end',
    position: 'absolute',
    right: 20,
    top: 20,
  },
  header_usr: {
    color: '#ffffff',
    alignItems: 'flex-end',
    position: 'absolute',
    left: 20,
    bottom: 20,
    fontWeight: 'bold',
    fontSize: 20
  }
});