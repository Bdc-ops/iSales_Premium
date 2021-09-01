import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Alert } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-community/async-storage';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNBackgroundDownloader from 'react-native-background-downloader';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Profile_client_navbar from '../../navbars/clients/edit_profile_client_navbar'
import CardView from 'react-native-cardview'
const delete_image = require('../../res/delete.png');
import axios from 'axios';
import ButtonSpinner from 'react-native-button-spinner';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import moment from 'moment';
var { width } = Dimensions.get('window');
const disconnected = require('../../res/notfound.png');


export default class delete_client extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;

    this.state = {
      state_connection: '',
    };

  }

  componentDidMount() {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    this._isMounted = true;
    NetInfo.fetch().then(state => {
      this.setState({ state_connection: state.isConnected })
    });
  }


  componentWillMount() {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.closeDB(db);
  }

  closeDB(db) {
    db.close(function () {
      console.log('database is closed ok');
    });
    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Supprimer client : Couper la connexion avec la base de donnee\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
  }

  delete_client(datauser_delete, resolve) {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    datauser_delete.map((rowData) => {
      AsyncStorage.getItem('serv_name')
        .then(server => {
          AsyncStorage.getItem('user_token')
            .then(token => {
              axios.delete(`${server}/api/index.php/thirdparties/${rowData.ref}`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                .then(response => {
                  if (response.status === 200) {
                    db.transaction(tx => {
                      tx.executeSql(
                        'DELETE FROM clients where ref=?',
                        [rowData.ref],
                        (tx, results) => {
                          console.log('Results', results.rowsAffected);
                          if (results.rowsAffected > 0) {
                            resolve("api ok");
                            let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Supprimer client : client BIEN SUPPRIMER, ref:" + rowData.ref + " \n-------";
                            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
                            Alert.alert(
                              "IMPORTANT",
                              "Le client a bien été supprimé de la base de données",
                              [
                                { text: "J'ai compris !", onPress: () => this.props.navigation.navigate('Clients') }
                              ],
                              { cancelable: false }
                            );
                          } else {
                            alert('Erreur : Veuillez synchroniser l’application puis ressayer ');
                          }
                        }
                      );
                    });
                  }
                })
                .catch(error => {
                  let log_msg4 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Supprimer client : ERROR de serveur lors de la suppression du client, error:" + error + " \n-------";
                  RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg4, 'utf8');
                })
            })
        })
        .catch((error) => {
          alert('Erreur : La suppression du client a échoué');
        })
    })
  }

  async delete_alert(datauser_delete) {
    return new Promise(async (resolve, reject) => {
      NetInfo.fetch().then(async (state) => {
        if (state.isConnected) {
          Alert.alert(
            "IMPORTANT",
            "Veuillez re-confirmer l'opération",
            [
              {
                text: "Annuler",
                onPress: () => resolve("api ok"),
                style: "cancel"
              },
              {
                text: "Confirmer", onPress: () => this.delete_client(datauser_delete, resolve)
              }
            ],
            { cancelable: false }
          );
        } else {
          Alert.alert('IMPORTANT', 'Cette opération nécessite une connexion internet');
        }
      });

    });
  }

  render() {
    const { navigate } = this.props.navigation;
    const { navigation } = this.props;
    const datauser_delete = navigation.getParam('datauser_delete');
    return (
      <ScrollView contentContainerStyle={styles.containerMain} >
        <Profile_client_navbar title={navigate}></Profile_client_navbar>
        <View style={styles.container}>
          <View style={styles.containerResults}>
            <View style={styles.cardViewStyle}>
              {
                this.state.state_connection ?
                  (
                    <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle1}>
                      <Image style={styles.img} source={delete_image} />
                      <Text>Veuillez confirmer la suppression définitive du client</Text>
                      <Text style={styles.importantmessage}>Cette opération nécessite une connexion internet *</Text>
                      <ButtonSpinner positionSpinner={'centered-without-text'} styleSpinner={{ style: { textAlign: 'center', color: '#ffffff' } }}
                        onPress={this.delete_alert.bind(this, datauser_delete)} style={styles.SubmitButtonStyle}>
                        <Icon name="check" size={30} style={styles.iconDelete} />
                      </ButtonSpinner>
                    </CardView>
                  )
                  :
                  (
                    <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle1}>
                      <Image style={styles.disconnected_img} source={disconnected} />
                      <Text style={styles.importantmessage}>Cette opération nécessite une connexion internet</Text>
                      <Text style={styles.importantmessage}>Veuillez verifier votre connexion</Text>
                    </CardView>
                  )
              }
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
}




const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },

  containerMain: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',

  },
  containerResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },

  cardViewStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    //width:'90%'
  },
  img: {
    width: 350,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  SubmitButtonStyle: {
    margin: 25,
    padding: 10,
    backgroundColor: '#d64541',
    borderRadius: 50,
    width: 80,
    height: 80,
  },
  iconDelete: {
    color: '#ffffff',
    textAlign: 'center',
    paddingTop: 15,
    paddingBottom: 15,
  },
  cardViewStyle1: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    width: width - 100,
  },
  importantmessage: {
    color: '#d64541',
    marginBottom: 20,
  },
  disconnected_img: {
    width: 350,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    marginTop: 50,
  },
});