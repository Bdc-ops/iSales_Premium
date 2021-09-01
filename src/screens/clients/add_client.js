import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Linking, TextInput, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNBackgroundDownloader from 'react-native-background-downloader';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Profile_client_navbar from '../../navbars/clients/add_profile_client_navbar'
import CardView from 'react-native-cardview'
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import ButtonSpinner from 'react-native-button-spinner';
import Toast from 'react-native-toast-native';
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment';
var { width } = Dimensions.get('window');

const disconnected = require('../../res/notfound.png');


export default class add_client extends React.Component {

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
    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Nouveau client : Couper la connexion avec la base de donnee\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
  }


  async add_client(codeclient, resolve) {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    const { nom_entreprise, adresse, codepostale, ville, pays, code_pays, tel, fax, email, skype, siteweb, siren, siret, naf_ape, rcs_rm, notes } = this.state;
    const data = { name: nom_entreprise, country: pays, country_id: code_pays, pays: pays, town: ville, zip: codepostale, address: adresse, phone: tel, fax: fax, email: email, skype: skype, url: siteweb, idprof1: siren, idprof2: siret, idprof3: naf_ape, idprof4: rcs_rm, note: notes, note_public: notes, client: '1', code_client: codeclient };
    console.log('########################################');
    console.log('place 1');
    console.log('start adding client');
    console.log('code client :' + codeclient);

    AsyncStorage.getItem('serv_name')
      .then(async (server) => {
        AsyncStorage.getItem('user_token')
          .then(async (token) => {
            console.log('token ' + server + ' - ' + token);
            await axios(
              {
                method: 'post',
                url: `${server}/api/index.php/thirdparties`,
                headers: { 'DOLAPIKEY': token, 'Accept': 'application/json' },
                data: data,
              }
            )
              .then(async (response) => {
                console.log('add client axios OK');

                if (response.status === 200) {
                  console.log('place 3');

                  console.log('returned id  : '+response.data);


                  db.transaction((tx) => {
                    console.log('place 4');

                    tx.executeSql(
                      'INSERT INTO clients (name,country,code_pays,town,zip,address,phone,fax,email,skype,url,idprof1,idprof2,idprof3,idprof4,note,code_client,code_fournisseur,ref) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                      [this.state.nom_entreprise, this.state.pays, this.state.code_pays, this.state.ville, this.state.codepostale, this.state.adresse, this.state.tel, this.state.fax, this.state.email, this.state.skype, this.state.siteweb, this.state.siren, this.state.siret, this.state.naf_ape, this.state.rcs_rm, this.state.notes, codeclient, '', response.data],
                      (tx, results) => {
                        console.log('place 5');
                        console.log("Insered Data : "+this.state.nom_entreprise+"-"+this.state.pays+"-"+this.state.code_pays+"-"+this.state.ville+"-"+this.state.codepostale+"-"+this.state.adresse+"-"+this.state.tel+"-"+this.state.fax+"-"+this.state.email+"-"+this.state.skype+"-"+this.state.siteweb+"-"+this.state.siren+"-"+this.state.siret+"-"+this.state.naf_ape+"-"+this.state.rcs_rm+"-"+this.state.notes+"-"+codeclient+"-"+'..'+"-"+response.data);

                        console.log('Results', results.rowsAffected);
                        if (results.rowsAffected > 0) {
                          console.log('place 6');
                          let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Nouveau client : client BIEN AJOUTER : (" + this.state.nom_entreprise + "," + this.state.pays + "," + this.state.code_pays + "," + this.state.ville + "," + this.state.codepostale + "," + this.state.adresse + "," + this.state.tel + "," + this.state.fax + "," + this.state.email + "," + this.state.skype + "," + this.state.siteweb + "," + this.state.siren + "," + this.state.siret + "," + this.state.naf_ape + "," + this.state.rcs_rm + "," + this.state.notes + "," + codeclient + "," + response.data + " \n-------";
                          RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
                          resolve("api ok");
                          Alert.alert(
                            "IMPORTANT",
                            "Le client a bien été ajouté. Merci de synchroniser l’application. ",
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
              .catch(async (error) => {
                console.log('error 1 ' + error);
                let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Nouveau client : ERROR serveur" + error + " \n-------";
                RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
              })
          })
          .catch(async (error) => {
            console.log('error 2 ' + error);
          })
      })
      .catch(async (error) => {
        console.log('error 3 ' + error);
      });
  }


  async add_client_alert() {
    return new Promise(async (resolve, reject) => {
      NetInfo.fetch().then(async (state) => {
        if (state.isConnected) {

          console.log('device connected');

          //##################################################
          //Get last code client and increment it
          //if (this.state.nom_entreprise != '') {
          if ((this.state.nom_entreprise != '') && (this.state.pays != '')) {

            AsyncStorage.getItem('serv_name')
              .then(server => {
                AsyncStorage.getItem('user_token')
                  .then(token => {
                    axios.get(`${server}/api/index.php/thirdparties?sortfield=t.datec&sortorder=DESC&limit=1&page=0`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                      .then(response => {
                        if (response.status === 200) {
                          console.log('status OK');
                          var codeclient = '';
                          if (response.data[0].code_client != null) {
                            var text = response.data[0].code_client;
                            var getPart = text.slice(-4);
                            var num = parseInt(getPart);
                            var newVal = num + 1;
                            var reg = new RegExp(num);
                            var newstring = text.replace(reg, newVal);
                            codeclient = newstring;
                          }
                          console.log('alert ok');
                          console.log('code client : ' + codeclient);
                          Alert.alert(
                            "IMPORTANT",
                            "Voulez-vous vraiment ajouter le client à votre base de données ?",
                            [
                              {
                                text: "Annuler",
                                onPress: () => resolve("api ok"),
                                style: "cancel"
                              },
                              {
                                text: "Confirmer", onPress: () => this.add_client(codeclient, resolve)
                              }
                            ],
                            { cancelable: false }
                          );
                        }
                      })
                      .catch(error => {
                        let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Nouveau client : ERROR cant get last client ref, error:" + error + " \n-------";
                        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
                      });
                  });
              });

          } else {
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

          //##################################################
        } else {
          resolve("api ok");
          Alert.alert('IMPORTANT', 'Cette opération nécessite une connexion internet');
        }
      });
    });
  }

  render() {

    const { navigate } = this.props.navigation;



    return (

      <ScrollView contentContainerStyle={styles.containerMain} >
        <Profile_client_navbar title={navigate}></Profile_client_navbar>




        <View style={styles.container}>
          <View style={styles.containerResults}>


            <View style={styles.cardViewStyle}>


              {
                this.state.state_connection ?
                  (
                    <View>
                      <Text style={styles.titles}>Ajouter un nouveau client</Text>
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
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ nom_entreprise: text })}></TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.adresse = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ adresse: text })}></TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.codepostale = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ codepostale: text })}></TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.ville = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ ville: text })}></TextInput>





                            <DropDownPicker
                              items={[
                                { value: '0', label: 'Sélectionner un pays' },
                                { value: '1', label: 'France' },
                                { value: '2', label: 'Belgium' },
                                { value: '140', label: 'Luxembourg' },
                                /*{ value: '141', label: 'Macao' },*/
                              ]}
                              style={styles.inputs}
                              defaultIndex={0}
                              placeholder="Sélectionner un pays"
                              onChangeItem={item => this.setState({ pays: item.label, code_pays: item.value })}
                            />

                            <Text style={styles.text}></Text>

                            <TextInput style={styles.inputs} ref={input => { this.tel = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ tel: text })}></TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.fax = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ fax: text })}></TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.email = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ email: text })}></TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.skype = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ skype: text })}></TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.siteweb = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ siteweb: text })}></TextInput>

                            <Text style={styles.text}></Text>

                            <TextInput style={styles.inputs} ref={input => { this.siren = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ siren: text })}></TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.siret = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ siret: text })}></TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.naf_ape = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ naf_ape: text })}></TextInput>
                            <TextInput style={styles.inputs} ref={input => { this.rcs_rm = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ rcs_rm: text })}></TextInput>

                            <Text style={styles.text}></Text>

                            <TextInput style={styles.inputs} ref={input => { this.notes = input }}
                              returnKeyLabel={"next"} onChangeText={(text) => this.setState({ notes: text })}></TextInput>

                          </View>
                        </View>

                        <View style={styles.SubmitButtonContainer}>
                          <Text style={styles.importantmessage}>Cette opération nécessite une connexion internet *</Text>




                          <ButtonSpinner positionSpinner={'centered-without-text'} styleSpinner={{ style: { textAlign: 'center', color: '#ffffff' } }}
                            onPress={this.add_client_alert.bind(this)} style={styles.SubmitButtonStyle}>
                            <Icon name="save" size={30} style={styles.iconEdit} />
                          </ButtonSpinner>
                        </View>

                      </CardView>
                    </View>
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
    //flexDirection: 'row',
    //justifyContent: 'center',
    width: '90%'
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
    alignItems: 'center',
    justifyContent: 'center',
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