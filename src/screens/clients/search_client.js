import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Linking, TextInput } from 'react-native';
import RNFS, { stat } from 'react-native-fs';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNBackgroundDownloader from 'react-native-background-downloader';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Search_client_navbar from '../../navbars/clients/recherche_client_navbar'
import CardView from 'react-native-cardview'
import { Spinner } from '../../Spinner';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import ButtonSpinner from 'react-native-button-spinner';
import moment from 'moment';

var { width } = Dimensions.get('window');

const searchImg = require('../../res/search.png');
const avatar_image = require('../../res/avatar.png');
const notfound = require('../../res/notfound.png');
export default class search_client extends React.Component {

  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      rechercheinput: '',
      SearchData: [],
      search_timer: 0,
      found: 0,
      declancheur: 0,
    };
  }

  componentDidMount() {
    this._isMounted = true;
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
    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Recherche client : Couper la connexion avec la base de donnee\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
  }

  search() {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    const { rechercheinput } = this.state;
    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Recherche client : input:" + rechercheinput + " \n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
    this.setState({ search_timer: 1, found: 0, declancheur: 1 });
    db.transaction(tx => {
      tx.executeSql(`SELECT name,country,code_pays,town,zip,address,phone,fax,email,skype,url,idprof1,idprof2,idprof3,idprof4,note,code_client,code_fournisseur,ref FROM clients where name LIKE '${rechercheinput}%' OR name LIKE '%${rechercheinput}' OR name LIKE '%${rechercheinput}%' OR name LIKE '${rechercheinput}' OR ref LIKE '${rechercheinput}%' OR ref LIKE '%${rechercheinput}' OR ref LIKE '%${rechercheinput}%' OR ref LIKE '${rechercheinput}'`, [], (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        this.setState({
          SearchData: temp,
          found: 1,
          search_timer: null
        });
      });
    });

  }


  _Showprofile(index) {
    this.props.navigation.navigate('ShowClient', { ref_client: index });
    let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Recherche client : voir fiche client, ref:" + index + " \n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
    //alert(`This is row ${index}`);
  }

  results(state) {

    if (state.declancheur === 0) {
      return (
        <View style={styles.searching_view}>
          <Image style={styles.img} source={searchImg} />
        </View>
      );
    } else {
      if (state.search_timer === 1) {
        return (
          <View style={styles.searching_view}>
            <Image style={styles.img} source={searchImg} />
            <Text style={styles.searching_text}>Recherche en cours ...</Text>
            <Spinner />
          </View>
        );
      } else {
        if ((state.found === 1) && (state.SearchData.length > 0)) {

          return (
            state.SearchData.map((rowData, index) => (
              <CardView key={index} cardElevation={10} cornerRadius={5} style={styles.cardViewStyle2}>
                <TouchableOpacity style={styles.cardViewStyle2}
                  onPress={() => this._Showprofile(rowData.ref)}>
                  <Image style={styles.circle} source={avatar_image} />
                  <View style={styles.details}>
                    <View style={styles.entreprise}>
                      <Text style={styles.entreprisename}>{rowData.name}
                      </Text>
                    </View>

                    <View style={styles.country}>
                      <Icon name="globe-europe" size={15} style={styles.iconDetails} />
                      {rowData.country ?
                        (<Text>{rowData.country}</Text>)
                        :
                        (<Text>- - - -</Text>)
                      }
                    </View>
                    <View style={styles.city}>
                      <Icon name="city" size={15} style={styles.iconDetails} />
                      {rowData.town ?
                        (<Text>{rowData.town}</Text>)
                        : (<Text>- - - -</Text>)
                      }
                    </View>
                  </View>
                </TouchableOpacity>

              </CardView>

            ))
          );
        } else if ((state.found === 1) && (state.SearchData.length === 0)) {
          return (
            <View style={styles.searching_view}>
              <Image style={styles.img} source={notfound} />
              <Text style={styles.searchnotfound_text}>Recherche non trouvée</Text>
            </View>
          );
        }
      }
    }






  }



  render() {
    const state = this.state;
    const { navigate } = this.props.navigation;

    return (

      <ScrollView contentContainerStyle={styles.containerMain} >

        <Search_client_navbar title={navigate}></Search_client_navbar>



        <View style={styles.container}>
          <View style={styles.containerResults}>

            <View style={styles.cardViewStyle}>
              <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle1}>

                <View style={styles.SearchContainer}>
                  <TextInput style={styles.inputs} placeholder="Recherche par nom d’entreprise"
                    ref={input => { this.rechercheinput = input }} onChangeText={(text) => this.setState({ rechercheinput: text })}></TextInput>
                  <TouchableOpacity style={styles.SubmitButtonStyle} activeOpacity={.5}
                    onPress={this.search.bind(this)}>
                    <Icon name="search" size={20} style={styles.iconSearch} />
                  </TouchableOpacity>
                </View>



              </CardView>
              {this.results(state)}





            </View>
          </View>
        </View>

      </ScrollView >
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
    backgroundColor: '#ffffff',

  },

  cardViewStyle: {
    //alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    //width:'90%'
  },
  SubmitButtonStyle: {
    margin: 25,
    padding: 10,
    backgroundColor: '#00BFA6',
    borderRadius: 50,
    width: 50,
    height: 50,
  },
  iconSearch: {
    color: '#ffffff',
    textAlign: 'center',
    paddingTop: 5,
    paddingBottom: 5,
  },
  cardViewStyle1: {
    //flex:1,
    //justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    width: width - 80,
  },
  inputs: {
    color: '#00BFA6',
    marginLeft: 20,
    textAlign: 'left',
    borderColor: '#00BFA6',
    borderWidth: 1,
    borderRadius: 25,
    color: '#00BFA6',
    width: '90%',
    paddingLeft: 25,
  },
  SearchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '80%',

  }, img: {
    width: 350,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    marginTop: 50,
  },
  entreprise: {
    marginLeft: 20,
    marginBottom: 15,
  },
  entreprisename: {
    color: '#00BFA6',
    fontSize: 20,
  },
  country: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 20,
  },
  city: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 20,
  },
  iconDetails: {
    marginRight: 10,
    color: '#00BFA6',
  }, circle: {
    margin: 20,
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
    backgroundColor: '#CED4DA',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    margin: 20,
  },
  cardViewStyle2: {
    //flex:1,
    margin: 10,
    width: width - 80,
    flexDirection: 'row',
  },
  searching_text: {
    alignItems: 'center',
    justifyContent: 'center',
    color: '#00BFA6',
  },
  searching_view: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchnotfound_text: {
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d64541',
  }
});