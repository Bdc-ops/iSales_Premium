import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Linking, DrawerLayoutAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNBackgroundDownloader from 'react-native-background-downloader';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Profile_client_navbar from '../../navbars/clients/profile_client_navbar'
import CardView from 'react-native-cardview'
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import moment from 'moment';
var { width } = Dimensions.get('window');


export default class show_client extends React.Component {

  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      ProfileData: [],
    };
  }

  componentDidMount() {
    let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Fiche client \n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    this._isMounted = true;
    const { navigation } = this.props;
    const ref_client = this.props.navigation.getParam('ref_client');
    this._getProfileData(ref_client)
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
    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Fiche client : Couper la connexion avec la base de donnee\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
  }

  _getProfileData(ref_client) {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    db.transaction(tx => {
      tx.executeSql(`SELECT name,country,code_pays,town,zip,address,phone,fax,email,skype,url,idprof1,idprof2,idprof3,idprof4,note,code_client,code_fournisseur,ref FROM clients where ref=${ref_client}`, [], (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
          let log_msg4 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Fiche client :" + results.rows.item(i).name + " \n-------";
          RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg4, 'utf8');
        }
        this.setState({
          ProfileData: temp,
        });

      });
    });
  }

  render() {
    const state = this.state;
    const { navigate } = this.props.navigation;

    return (

      <ScrollView contentContainerStyle={styles.containerMain} >

        <Profile_client_navbar title={state.ProfileData} subtitle={navigate}></Profile_client_navbar>



        <View style={styles.container}>
          <View style={styles.containerResults}>
            <View style={styles.cardViewStyle}>

              {state.ProfileData.map((rowData, index) => (
                <View key={index}>


                  <View style={styles.Headericons}>
                    <TouchableOpacity style={styles.Headericons_circle} activeOpacity={.5}
                      onPress={() => { Linking.openURL('mailto:' + rowData.email); }}>
                      <Icon name="envelope" size={20} style={styles.icons} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.Headericons_circle} activeOpacity={.5}
                      onPress={() => { Linking.openURL('tel:' + rowData.phone); }}>
                      <Icon name="phone" size={20} style={styles.icons} />
                    </TouchableOpacity>

                  </View>


                  <Text style={styles.titles}>Informations initials</Text>

                  <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle1}>
                    <View style={styles.entreprise}>
                      <Text>Nom de l'entreprise</Text>
                      <Text>Adresse</Text>
                      <Text>Code postale</Text>
                      <Text>Ville</Text>
                      <Text>Pays</Text>
                    </View>
                    <View>
                      <Text style={styles.inputs}>{rowData.name}</Text>
                      <Text style={styles.inputs}>{rowData.address}</Text>
                      <Text style={styles.inputs}>{rowData.zip}</Text>
                      <Text style={styles.inputs}>{rowData.town}</Text>
                      <Text style={styles.inputs}>{rowData.country}</Text>
                    </View>
                  </CardView>
                  <Text style={styles.titles}>Contacts</Text>
                  <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle2}>
                    <View style={styles.entreprise}>
                      <Text>Téléphone</Text>
                      <Text>Fax</Text>
                      <Text>Email</Text>
                      <Text>Skype</Text>
                      <Text>Site web</Text>
                    </View>
                    <View>
                      <Text style={styles.inputs}>{rowData.phone}</Text>
                      <Text style={styles.inputs}>{rowData.fax}</Text>
                      <Text style={styles.inputs}>{rowData.email}</Text>
                      <Text style={styles.inputs}>{rowData.skype}</Text>
                      <Text style={styles.inputs}>{rowData.url}</Text>
                    </View>
                  </CardView>

                  <Text style={styles.titles}>Informations juridique</Text>
                  <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle2}>
                    <View style={styles.entreprise}>
                      <Text>SIREN</Text>
                      <Text>SIRET</Text>
                      <Text>NAF-APE</Text>
                      <Text>RCS/RM</Text>
                    </View>
                    <View>
                      <Text style={styles.inputs}>{rowData.idprof1}</Text>
                      <Text style={styles.inputs}>{rowData.idprof2}</Text>
                      <Text style={styles.inputs}>{rowData.idprof3}</Text>
                      <Text style={styles.inputs}>{rowData.idprof4}</Text>
                    </View>
                  </CardView>
                  <Text style={styles.titles}>Notes</Text>
                  <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle2}>
                    <View style={styles.entreprise}>
                      <Text>Notes</Text>
                    </View>
                    <View>
                      <Text style={styles.inputs}>{rowData.note}</Text>
                    </View>
                  </CardView>


                </View>

              ))}





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
  titles: {
    marginTop: 25,
    color: '#00BFA6',
    fontSize: 20,
  },
  Headericons_circle: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 15,
    backgroundColor: '#00BFA6',
    borderRadius: 50,
    width: 40,
    height: 40,
    marginLeft: 10,
  },
  Headericons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

  },
  icons: {
    color: '#ffffff',
    alignItems: 'flex-end'
  },
});