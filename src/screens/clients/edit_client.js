import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Linking, TextInput, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNBackgroundDownloader from 'react-native-background-downloader';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Profile_client_navbar from '../../navbars/clients/edit_profile_client_navbar'
import CardView from 'react-native-cardview'
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import DropDownPicker from 'react-native-dropdown-picker';
import ButtonSpinner from 'react-native-button-spinner';
import Toast from 'react-native-toast-native';
import moment from 'moment';
var { width } = Dimensions.get('window');
const disconnected = require('../../res/notfound.png');


export default class edit_client extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      nom_entreprise: '',
      adresse: '',
      codepostale: '',
      ville: '',
      pays: '',
      code_pays: '',
      tel: '',
      fax: '',
      email: '',
      skype: '',
      siteweb: '',
      siren: '',
      siret: '',
      naf_ape: '',
      rcs_rm: '',
      notes: '',
      ref: '',
      state_connection: '',
    };

  }




  componentDidMount() {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    this._isMounted = true;
    NetInfo.fetch().then(state => {
      this.setState({ state_connection: state.isConnected })
    });
    const { navigation } = this.props;
    const datauser_edit = navigation.getParam('datauser_edit');
    //const datauser_edit = this.props.route.params.datauser_edit;

    /*
        if (this.state.code_pays === 1) { this.setState({ pays: 'France' }, function () { console.log('pays : ' + this.state.pays); }) }
        else if (this.state.code_pays === 2) { this.setState({ pays: 'Belgium' }, function () { console.log('pays : ' + this.state.pays); }) }
        else if (this.state.code_pays === 140) { this.setState({ pays: 'Luxembourg' }, function () { console.log('pays : ' + this.state.pays); }) }
        else if (this.state.code_pays === 141) { this.setState({ pays: 'Macao' }, function () { console.log('pays : ' + this.state.pays); }) }
    */
    datauser_edit.map((rowData) => {
      if (this.state.nom_entreprise === '') { this.setState({ nom_entreprise: rowData.name }, function () { console.log(this.state.nom_entreprise); }) }
      if (this.state.adresse === '') { this.setState({ adresse: rowData.address }, function () { console.log(this.state.adresse); }) }
      if (this.state.codepostale === '') { this.setState({ codepostale: rowData.zip }, function () { console.log(this.state.codepostale); }) }
      if (this.state.ville === '') { this.setState({ ville: rowData.town }, function () { console.log(this.state.ville); }) }
      /*if (this.state.pays === '') {
        if (rowData.country === 1) { this.setState({ pays: 'France' }, function () { console.log('pays : ' + this.state.pays); }) }
        else if (rowData.country === 2) { this.setState({ pays: 'Belgium' }, function () { console.log('pays : ' + this.state.pays); }) }
        else if (rowData.country === 140) { this.setState({ pays: 'Luxembourg' }, function () { console.log('pays : ' + this.state.pays); }) }
        else if (rowData.country === 141) { this.setState({ pays: 'Macao' }, function () { console.log('pays : ' + this.state.pays); }) }
      }*/


      if (this.state.pays === '') { this.setState({ pays: rowData.pays }, function () { console.log(this.state.pays); }) }
      if (this.state.code_pays === '') { this.setState({ code_pays: rowData.code_pays }, function () { console.log(this.state.code_pays); }) }
      if (this.state.tel === '') { this.setState({ tel: rowData.phone }, function () { console.log(this.state.tel); }) }
      if (this.state.fax === '') { this.setState({ fax: rowData.fax }, function () { console.log(this.state.fax); }) }
      if (this.state.email === '') { this.setState({ email: rowData.email }, function () { console.log(this.state.email); }) }
      if (this.state.skype === '') { this.setState({ skype: rowData.skype }, function () { console.log(this.state.skype); }) }
      if (this.state.siteweb === '') { this.setState({ siteweb: rowData.url }, function () { console.log(this.state.siteweb); }) }
      if (this.state.statut_commercial === '') { this.setState({ statut_commercial: rowData.statut_commercial }, function () { console.log(this.state.statut_commercial); }) }
      if (this.state.forme_juridique === '') { this.setState({ forme_juridique: rowData.forme_juridique }, function () { console.log(this.state.forme_juridique); }) }
      if (this.state.siren === '') { this.setState({ siren: rowData.idprof1 }, function () { console.log(this.state.siren); }) }
      if (this.state.siret === '') { this.setState({ siret: rowData.idprof2 }, function () { console.log(this.state.siret); }) }
      if (this.state.naf_ape === '') { this.setState({ naf_ape: rowData.idprof3 }, function () { console.log(this.state.naf_ape); }) }
      if (this.state.rcs_rm === '') { this.setState({ rcs_rm: rowData.idprof4 }, function () { console.log(this.state.rcs_rm); }) }
      if (this.state.notes === '') { this.setState({ notes: rowData.note }, function () { console.log(this.state.notes); }) }
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
    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Modifier client : Couper la connexion avec la base de donnee\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
  }
  edit_client(id_client, datauser_edit, resolve) {
    /*const { nom_entreprise, adresse, codepostale, ville, pays, tel, fax, email, skype, siteweb, statut_commercial, forme_juridique,
      siren, siret, naf_ape, rcs_rm, notes } = this.state;*/
    //const codec = Math.random().toString(36).substring(7);


    var db = openDatabase({ name: 'iSalesDatabase.db' });
    const data = { name: this.state.nom_entreprise, country: this.state.pays, country_id: this.state.code_pays, town: this.state.ville, zip: this.state.codepostale, address: this.state.adresse, phone: this.state.tel, fax: this.state.fax, email: this.state.email, skype: this.state.skype, url: this.state.siteweb, idprof1: this.state.siren, idprof2: this.state.siret, idprof3: this.state.naf_ape, idprof4: this.state.rcs_rm, note: this.state.notes, note_public: this.state.notes };
    AsyncStorage.getItem('serv_name')
      .then(server => {
        AsyncStorage.getItem('user_token')
          .then(token => {
            axios(
              {
                method: 'PUT',
                url: `${server}/api/index.php/thirdparties/${id_client}`,
                headers: { 'DOLAPIKEY': token, 'Accept': 'application/json' },
                data: data,
              }
            )
              .then(response => {
                if (response.status === 200) {


                  db.transaction((tx) => {
                    tx.executeSql(
                      `UPDATE clients set name=? ,country=? ,code_pays=?,town=? ,zip=? ,address=? ,phone=? ,fax=? ,email=? ,skype=? ,url=? ,idprof1=? ,idprof2=? ,idprof3=? ,idprof4=? ,note=? where ref=${id_client}`,
                      [this.state.nom_entreprise, this.state.pays, this.state.code_pays, this.state.ville, this.state.codepostale, this.state.adresse, this.state.tel, this.state.fax, this.state.email, this.state.skype, this.state.siteweb, this.state.siren, this.state.siret, this.state.naf_ape, this.state.rcs_rm, this.state.notes],
                      (tx, results) => {
                        console.log('Results', results.rowsAffected);
                        if (results.rowsAffected > 0) {
                          resolve("api ok");
                          let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Modifier client : client BIEN MODIFIER, rowid:" + id_client + " \n-------";
                          RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
                          Alert.alert(
                            "IMPORTANT",
                            "Les modifications ont bien été faites",
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
                resolve("api ok");
                console.log(error);
                let log_msg4 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Modifier client : ERROR de serveur lors de la modification du client, ref:" + error + " \n-------";
                RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg4, 'utf8');
              })
          })
          .catch(error => {
            resolve("api ok");
            console.log(error);
          })
      })
      .catch(error => {
        resolve("api ok");
        console.log(error);
      });
  }

  async edit_client_alert(id_client, datauser_edit) {
    return new Promise(async (resolve, reject) => {
      NetInfo.fetch().then(async (state) => {
        if (state.isConnected) {
          if ((this.state.nom_entreprise != '') && (this.state.pays != '')) {
            Alert.alert(
              "IMPORTANT",
              "Êtes-vous sûr de vouloir modifier les informations du client ?",
              [
                {
                  text: "Annuler",
                  onPress: () => resolve("api ok"),

                  style: "cancel"
                },
                {
                  text: "Confirmer", onPress: () => this.edit_client(id_client, datauser_edit, resolve)
                }
              ],
              { cancelable: false }
            );
          }
          else {
            resolve("api ok");
            const errortoast = {
              backgroundColor: "#d64541",
              color: "#ffffff",
              fontSize: 15,
              borderRadius: 50,
              fontWeight: "bold",
              yOffset: 200
            };
            Toast.show('Veuillez remplir tous les champs demandés', Toast.LONG, Toast.TOP, errortoast);
          }

        } else {
          resolve("api ok");
          Alert.alert('IMPORTANT', 'Cette opération nécessite une connexion internet');
        }
      });
    });
  }


  render() {
    const { navigation } = this.props;
    const datauser_edit = navigation.getParam('datauser_edit');
    //const datauser_edit = this.props.route.params.datauser_edit;
    const { navigate } = this.props.navigation;


    return (

      <ScrollView contentContainerStyle={styles.containerMain} >

        <Profile_client_navbar title={navigate}></Profile_client_navbar>

        <View style={styles.container}>
          <View style={styles.containerResults}>
            <View style={styles.cardViewStyle}>
              {
                this.state.state_connection ?

                  datauser_edit.map((rowData, index) => (
                    <View key={index}>
                      <Text style={styles.titles}>Modification des informations client</Text>
                      <CardView cardElevation={10} cornerRadius={5}>
                        <View style={styles.cardViewStyle1}>
                          <View style={styles.entreprise}>
                            <Text style={styles.text}>Nom de l'entreprise *</Text>
                            <Text style={styles.text}>Adresse</Text>
                            <Text style={styles.text}>Code postale</Text>
                            <Text style={styles.text}>Ville</Text>
                            <Text style={styles.text}>Pays *</Text>

                            <Text style={styles.text1}></Text>

                            <Text style={styles.text}>Téléphone</Text>
                            <Text style={styles.text}>Fax</Text>
                            <Text style={styles.text}>Email</Text>
                            <Text style={styles.text}>Skype</Text>
                            <Text style={styles.text}>Site web</Text>

                            <Text style={styles.text2}></Text>

                            <Text style={styles.text}>SIREN</Text>
                            <Text style={styles.text}>SIRET</Text>
                            <Text style={styles.text}>NAF-APE</Text>
                            <Text style={styles.text}>RCS/RM</Text>

                            <Text style={styles.text3}></Text>

                            <Text>Notes</Text>


                          </View>
                          <View>
                            <TextInput style={styles.inputs} ref={input => { this.nom_entreprise = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ nom_entreprise: text })}>{rowData.name}</TextInput>


                            <TextInput style={styles.inputs} ref={input => { this.adresse = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ adresse: text })}>{rowData.address}</TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.codepostale = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ codepostale: text })}>{rowData.zip}</TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.ville = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ ville: text })}>{rowData.town}</TextInput>


                            <DropDownPicker
                              items={[
                                { value: '0', label: 'Sélectionner un pays' },
                                { value: '1', label: 'France' },
                                { value: '2', label: 'Belgium' },
                                { value: '140', label: 'Luxembourg' },
                                /*{ value: '141', label: 'Macao' },*/
                              ]}
                              style={styles.inputs}
                              placeholder="Sélectionner un pays"
                              defaultValue={rowData.code_pays}
                              onChangeItem={item => this.setState({ pays: item.label, code_pays: item.value })}
                            />
                            <Text style={styles.text}></Text>



                            <TextInput style={styles.inputs} ref={input => { this.tel = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ tel: text })}>{rowData.phone}</TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.fax = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ fax: text })}>{rowData.fax}</TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.email = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ email: text })}>{rowData.email}</TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.skype = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ skype: text })}>{rowData.skype}</TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.siteweb = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ siteweb: text })}>{rowData.url}</TextInput>

                            <Text style={styles.text}></Text>

                            <TextInput style={styles.inputs} ef={input => { this.siren = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ siren: text })}>{rowData.idprof1}</TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.siret = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ siret: text })}>{rowData.idprof2}</TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.naf_ape = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ naf_ape: text })}>{rowData.idprof3}</TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.rcs_rm = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ rcs_rm: text })}>{rowData.idprof4}</TextInput>

                            <Text style={styles.text}></Text>

                            <TextInput style={styles.inputs} ref={input => { this.notes = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ notes: text })}>{rowData.note}</TextInput>

                          </View>
                        </View>

                        <View style={styles.SubmitButtonContainer}>
                          <Text style={styles.importantmessage}>Cette opération nécessite une connexion internet *</Text>

                          <ButtonSpinner positionSpinner={'centered-without-text'} styleSpinner={{ style: { textAlign: 'center', color: '#ffffff' } }}
                            onPress={this.edit_client_alert.bind(this, rowData.ref, datauser_edit)} style={styles.SubmitButtonStyle}>
                            <Icon name="check" size={30} style={styles.iconEdit} />
                          </ButtonSpinner>


                        </View>

                      </CardView>
                    </View>
                  )
                  )
                  :
                  (
                    <CardView cardElevation={10} cornerRadius={5} style={styles.disconnected_view}>
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
  head: { height: 40, backgroundColor: '#808B97' },
  text: { margin: 6 },
  row: { flexDirection: 'row', backgroundColor: '#FFF1C1' },
  btn: { width: 58, height: 18, backgroundColor: '#78B7BB', borderRadius: 2 },
  btnText: { textAlign: 'center', color: '#fff' },

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
  titles: {
    marginLeft: 25,
    marginBottom: 20,
    color: '#00BFA6',
    fontSize: 20,
  },
  inputs: {
    color: '#00BFA6',
    marginLeft: 20,
    textAlign: 'left',

  },
  cardViewStyle: {
    //alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    //justifyContent: 'center',
    //width:'90%'
  },

  cardViewStyle1: {
    flex: 1,
    //justifyContent: 'center',
    margin: 20,
    padding: 20,
    flexDirection: 'row',
    width: width - 100,
  },
  cardViewStyle2: {
    flex: 1,
    //justifyContent: 'center',
    margin: 20,
    padding: 20,
    width: width - 100,
    flexDirection: 'row',
  },
  inputs: {
    width: 300,
    height: 40,
    borderColor: '#00BFA6',
    borderWidth: 1,
    borderRadius: 5,
    color: '#00BFA6',
    marginBottom: 5,
    paddingLeft: 20,

  },
  text: {
    marginTop: 6,
    height: 40,
  },
  text1: {
    marginTop: 6,
    height: 35,
  },
  text2: {
    marginTop: 6,
    height: 35,
  },
  text3: {
    marginTop: 6,
    height: 40,
  },
  entreprise: {
    marginRight: 20,
  },
  SubmitButtonStyle: {
    marginBottom: 25,
    padding: 10,
    backgroundColor: '#00BFA6',
    borderRadius: 50,
    width: 80,
    height: 80,
  },
  SubmitButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEdit: {
    color: '#ffffff',
    textAlign: 'center',
    paddingTop: 15,
    paddingBottom: 15,
  },
  importantmessage: {
    color: '#d64541',
    marginBottom: 20,
  },
  disconnected_view: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    width: width - 100,
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