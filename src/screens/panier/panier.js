import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, TextInput, ImageBackground, Alert, Dimensions, DrawerLayoutAndroid } from 'react-native';
import DialogAndroid from 'react-native-dialogs';
import RNFS, { stat } from 'react-native-fs';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Panier_navbar from '../../navbars/panier/panier_navbar';
import CardView from 'react-native-cardview';
import Toast from 'react-native-toast-native';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import ButtonSpinner from 'react-native-button-spinner';
import moment from 'moment';
import Menu from '../menu';

var { width } = Dimensions.get('window');

const IMG1 = require('../../res/paniervide.png');


export default class Panier_ extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      panierData: [],
      qt: '',
      total: '',
      total_tva: '',
      total_ttc:'',
      //total_remise: '',
      rechercheinput: '',
      clientsliste: [],
      selectedclient: [],
      pressed: 0,
      found: 0,
      disablebutton: true,
      menuOpen: false,
      stop: 0
    };

  }


  handleMenu() {
    const { menuOpen } = this.state
    this.setState({
      menuOpen: !menuOpen
    })
  }


  async loadPanier() {
    console.log('Loading all panier data ########################')
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    await db.transaction(async (tx) => {
      await tx.executeSql(`SELECT * FROM panier`, [], async (tx, results) => {
        var temp = [];
        var totalprices = 0;
        var total_tva = 0;
        var tc=0;
        //var total_remise = 0;
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
          totalprices += (parseFloat(results.rows.item(i).price - ((results.rows.item(i).price * results.rows.item(i).remise) / 100)) * results.rows.item(i).qt);
          //total_tva += parseFloat(((results.rows.item(i).price * results.rows.item(i).qt) / 100) * results.rows.item(i).tva);
          if(results.rows.item(i).remise){
            total_tva += (((results.rows.item(i).price * results.rows.item(i).qt) / 100 * results.rows.item(i).tva)*(1-results.rows.item(i).remise / 100));

            console.log('totale tva => ((((('+results.rows.item(i).pvu+'*'+ results.rows.item(i).qt+')/100 )*(1-'+results.rows.item(i).remise+'/ 100)) *'+results.rows.item(i).tva+')');
  
          }else{
          total_tva += parseFloat((results.rows.item(i).price * results.rows.item(i).qt) / 100 * results.rows.item(i).tva);

            console.log('totale tva => ((((('+results.rows.item(i).pvu+'*'+ results.rows.item(i).qt+')/100 ) *'+results.rows.item(i).tva+')');
  
          }
         
          let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Panier : produit:" + results.rows.item(i).ref + " \n-------";
          RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');

          if (((results.rows.item(i).price - ((results.rows.item(i).price * results.rows.item(i).remise) / 100)) * results.rows.item(i).qt) === 0) {
            this.setState({ stop: 1 })
            let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Panier : produit with NULL price :" + results.rows.item(i) + " \n-------";
            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
          }
        }
        tc=this.state.total+this.state.total_tva;

        this.setState({
          panierData: temp,
          total: totalprices,
          total_tva: total_tva,
          total_ttc:tc
        });

        console.log('totale ht : '+totalprices);
        console.log('totale tva : '+total_tva);
        console.log('---------------------');
      });
    });
  }

  componentDidMount() {
    console.log(' Panier');
    let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Panier \n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
    this.loadPanier();
    this._isMounted = true;

  }
  /*componentWillMount() {
    console.log(' Panier 2');

    this.loadPanier();
    this._isMounted = true;

  }*/
  /*componentDidUpdate(prevProps) {
    if (this._isMounted == true) {
      this.loadPanier();
      console.log('update');
    }
  }*/

  componentWillUnmount() {
    console.log(' Panier 3');

    this._isMounted = false;
    console.log('stop');
    //this.closeDB(db);
  }

  _cleanAllMessage() {
    Alert.alert(
      "IMPORTANT",
      "Voulez-vous vraiment vider le panier ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Vider", onPress: () => this._cleanAll()
        }
      ],
      { cancelable: false }
    );
  }

  _cleanAll() {
    let log_msg4 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Panier : vider tous le panier \n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg4, 'utf8');
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM panier',
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log('le panier est bien vider');
            this.loadPanier();
          } else {
            console.log('error cleaning panier');
          }
        }
      );
      this.setState({ stop: 0 })
      this.loadPanier();
    });
  }

  _DeleteMessage(id) {
    Alert.alert(
      "IMPORTANT",
      "Voulez-vous vraiment supprimer le produit du panier ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer", onPress: () => this._Deleteproduct(id)
        }
      ],
      { cancelable: false }
    );
  }


  _Deleteproduct(id) {
    let log_msg5 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Panier : supprimer produit du produit :" + id + " \n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg5, 'utf8');
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM panier where id=${id}`,
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log('le produit est supprimer du panier');
            let log_msg6 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Panier : produit BIEN supprimer \n-------";
            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg6, 'utf8');
          } else {
            console.log('error produit non supprimer');
            let log_msg7 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Panier : produit NON supprimer \n-------";
            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg7, 'utf8');
          }
        }
      );
      this.setState({ stop: 0 })
      this.loadPanier();

    });
  }

  async selectionnerclient() {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    const { rechercheinput } = this.state;
    if (rechercheinput) {
      return new Promise(async (resolve, reject) => {
        this.setState({ found: 0 });
        db.transaction(async (tx) => {
          tx.executeSql(`SELECT name,code_client,ref FROM clients where name LIKE '${rechercheinput}%' OR name LIKE '%${rechercheinput}' OR name LIKE '%${rechercheinput}%' OR name LIKE '${rechercheinput}' OR ref LIKE '${rechercheinput}%' OR ref LIKE '%${rechercheinput}' OR ref LIKE '%${rechercheinput}%' OR ref LIKE '${rechercheinput}'`, [], async (tx, results) => {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push(results.rows.item(i));
            }
            if (results.rows.length > 0) {
              this.setState({ pressed: 1, clientsliste: temp, found: 1 });
              resolve("api ok");
              const { selectedItem } = await DialogAndroid.showPicker('Veuillez selectionner un client', null, {
                positiveText: 'Ok', // this is what makes disables auto dismiss
                cancelable: false,
                type: DialogAndroid.listRadio,
                selectedId: 'clientslist',
                items:
                  this.state.clientsliste.map((rowData, index) => (
                    {
                      label: rowData.name,
                      id: rowData.ref,
                    }
                  ))
              });
              if (selectedItem) {
                this.setState({ selectedclient: selectedItem, disablebutton: false });
                let log_msg8 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Panier : selectionner client :" + selectedItem.label + " \n-------";
                RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg8, 'utf8');
              }
            } else {
              this.setState({ found: 2, disablebutton: true });
              resolve("api ok");
            }

          });
        });
      })
    }
  }

  async validerpanier(navigate) {
    let log_msg9 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Panier : validation du panier \n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg9, 'utf8');
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    const errortoast = {
      backgroundColor: "#d64541",
      color: "#ffffff",
      fontSize: 15,
      borderRadius: 50,
      fontWeight: "bold",
      yOffset: 200
    };
    if (this.state.stop === 1) {
      Toast.show('Impossible d\’ajouter un produit qui a un prix nul', Toast.LONG, Toast.TOP, errortoast);
      let log_msg10 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Panier : Impossible de valider le panier avec un produit a zero \n-------";
      RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg10, 'utf8');
    } else {
      //state.selectedclient.label
      db.transaction(async (tx) => {

        tx.executeSql(
          `UPDATE panier set id_client=?`, [this.state.selectedclient.id],
          (tx, results) => {
            if (results.rowsAffected > 0) {
              navigate('Recap');
              let log_msg11 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Panier : VALIDER \n-------";
              RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg11, 'utf8');
            } else {
              let log_msg12 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Panier : ERROR : client non attribue a la commande \n-------";
              RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg12, 'utf8');
              Toast.show('Erreur lors de la modification du produit dans le panier', Toast.LONG, Toast.TOP, errortoast);
            }
          }
        );

      });
    }
  }

  _synclist() {
    this.loadPanier();
  }
  render() {
    const state = this.state;
    const { navigate } = this.props.navigation;
    const navigationView = (
      <Menu title={navigate} />
    );


    return (

      <DrawerLayoutAndroid
        ref={'DRAWER'}
        drawerWidth={350}
        drawerPosition={'left'}
        renderNavigationView={() => navigationView}>
        <ScrollView contentContainerStyle={styles.containerMain} >
          <Panier_navbar title={navigate}></Panier_navbar>


          <View style={styles.container}>
            <View style={styles.containerResults}>
              {
                state.panierData.length === 0 ?
                  (
                    <View style={styles.cardViewStyle0}>

                      <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle}>
                        <View style={styles.listeproduits}>
                          <View style={styles.clean_view}>
                            <Image style={styles.img} source={IMG1} />
                            <Text style={styles.clean_text}>Votre panier est vide pour le moment</Text>
                          </View>
                        </View>
                      </CardView>
                    </View>
                  )
                  :
                  (<View style={styles.cardViewStyle0}>
                    <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle1}>
                      <View style={styles.SearchContainer}>
                        <TextInput style={styles.inputsearchclient} placeholder="Selectionner un client"
                          ref={input => { this.rechercheinput = input }} onChangeText={(text) => this.setState({ rechercheinput: text })}></TextInput>


                        <ButtonSpinner positionSpinner={'centered-without-text'} styleSpinner={{ style: { textAlign: 'center', color: '#ffffff' } }}
                          onPress={this.selectionnerclient.bind(this)} style={styles.SubmitButtonStyle}>
                          <Icon name="search" size={15} color="#900" style={styles.iconSearch} />
                        </ButtonSpinner>
                      </View>



                      {
                        state.found === 1 ?
                          (
                            <View style={styles.selectedliste}>
                              <Text style={{ width: '10%' }}>Client : </Text>
                              <Text style={styles.selectedlistedetails}>{state.selectedclient.label}</Text>
                            </View>
                          )
                          :
                          state.found === 2 ?
                            (
                              <Text style={styles.clientnotfound}>Client non trouver</Text>
                            )
                            :
                            (
                              <Text></Text>
                            )

                      }
                    </CardView>
                    <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle}>
                      <View style={styles.listeproduits}>
                        <View style={styles.clean}>
                          <TouchableOpacity style={styles.SubmitButtonStyleCleanPanier} activeOpacity={.5}
                            onPress={() => this._cleanAllMessage()}>
                            <Icon name="trash" size={20} style={styles.iconCleanpanier} />
                            <Text style={styles.iconPanier}>Vider le panier</Text>
                          </TouchableOpacity>
                        </View>
                        <View>
                          <View style={styles.detailsproduits}>
                            <View style={styles.circleplace}></View>
                            <View style={styles.details}><Text>Produits</Text></View>
                            <View style={styles.qtdetails_header}><Text>Qté</Text></View>
                            <View style={styles.pricedetails_header}><Text>Total</Text></View>
                          </View>

                          {state.panierData.map((rowData, index) => (
                            <View key={index} style={styles.detailsproduits}>
                              <ImageBackground style={styles.circle} source={require('../../res/notfound_image.jpg')}>
                                <Image style={styles.circle} source={{ uri: 'file://' + RNFS.DocumentDirectoryPath + '/iSales_3/produits/images/' + rowData.ref + '.jpg' }} />
                              </ImageBackground>

                              <View style={styles.details}>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('EditProduitInfos', { ref: rowData.ref, qte: rowData.qt, pv: (parseFloat(rowData.price)).toFixed(2), type_commande: rowData.type_commande, remise: rowData.remise, pvu: rowData.pvu })}>
                                  <View style={styles.productheader}>
                                    <Text style={styles.productname}>{rowData.label} {rowData.type_commande === 'u' ? (<Text style={styles.commande_type}> [ Unité ]</Text>) : rowData.type_commande === 'c' ? <Text style={styles.commande_type}> [ Colis ]</Text> : rowData.type_commande === 'p' ? <Text style={styles.commande_type}> [ Palette ]</Text> : ''}</Text>
                                  </View>
                                </TouchableOpacity>
                                <View style={styles.productinfos}>
                                  <Text style={styles.TarifText}>Prix de vente colis : </Text>
                                  <Text style={styles.TarifText}>{(parseFloat(rowData.pvu)).toFixed(2)} € HT</Text>
                                </View>
                                {/*<View style={styles.productinfos}>
                                  <Text style={styles.TarifText}>{(parseFloat(rowData.price)).toFixed(2)} € HT</Text>
                                  <Text style={styles.TarifText}> - </Text>
                                  <Text style={styles.TarifText}>{(parseFloat(rowData.price_ttc)).toFixed(2)} € TTC</Text>
                                </View>*/}
                                <View style={styles.productinfos}>
                                  <Text style={styles.TarifText}>TVA : {(parseFloat(rowData.tva)).toFixed(2)} %</Text>
                                </View>
                                <View style={styles.productinfos}>
                                  <Text style={styles.TarifText}>Remise : {rowData.remise ? rowData.remise + ' %' : '0 %'}</Text>

                                  {
                                    ((rowData.price - ((rowData.price * rowData.remise) / 100)) * rowData.qt) === 0 ?
                                      (
                                        <TouchableOpacity style={styles.icondel} activeOpacity={.5} onPress={() => this._DeleteMessage(rowData.id, 1)}>
                                          <Icon name="trash" size={12} style={styles.icondel} />
                                        </TouchableOpacity>
                                      )
                                      :
                                      (
                                        <TouchableOpacity style={styles.icondel} activeOpacity={.5} onPress={() => this._DeleteMessage(rowData.id, 0)}>
                                          <Icon name="trash" size={12} style={styles.icondel} />
                                        </TouchableOpacity>
                                      )
                                  }


                                </View>



                              </View>
                              <View style={styles.qtdetails}>
                                <Text style={styles.qte}>{rowData.qt}</Text>
                              </View>

                              <View style={styles.pricedetails}>
                                {
                                  ((rowData.price - ((rowData.price * rowData.remise) / 100)) * rowData.qt) === 0 ?
                                    (<Text style={styles.price_null}>0.00</Text>)
                                    :
                                    (<Text style={styles.price}>{(parseFloat(rowData.price - ((rowData.price * rowData.remise) / 100)) * rowData.qt).toFixed(2)}</Text>)
                                }

                              </View>
                            </View>
                          ))}
                          <View style={{ borderBottomColor: 'black', borderBottomWidth: 1, }} />
                          <View style={styles.totalprices}>
                            <View style={styles.emptyrow}>
                              <Text style={styles.totalrenomination}>Total HT</Text>
                              <Text style={styles.totalrenomination}>Total TVA</Text>
                              <Text style={styles.totalrenomination}>Total TTC</Text>
                            </View>
                            <View style={styles.pricesrow}>
                              <Text style={styles.total}>{parseFloat(state.total).toFixed(2)} €</Text>
                              {/*<Text style={styles.total}>{(((state.total_tva / state.panierData.length) * state.total) / 100).toFixed(2)} €</Text> */}
                              <Text style={styles.total}>{parseFloat(state.total_tva).toFixed(2)} €</Text>
                              {/*<Text style={styles.total}>{(parseFloat(state.total) + (((state.total_tva / state.panierData.length) * state.total) / 100)).toFixed(2)} €</Text>*/}
                              <Text style={styles.total}>{parseFloat(state.total + state.total_tva).toFixed(2)} €</Text>
                              {/*<Text style={styles.total}>{state.total_ttc} €</Text> */}
                            </View>
                          </View>


                        </View>
                      </View>

                    </CardView>
                    <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle2}>
                      <View style={styles.clean}>
                        <TouchableOpacity style={styles.clean_on} activeOpacity={.5} onPress={this._cleanAllMessage.bind(this)}>
                          <Icon name="trash" size={20} style={styles.iconCleanpanier} />
                          <Text style={styles.iconPanier}>Vider le panier</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.submit}>
                        <TouchableOpacity style={state.disablebutton === true ? styles.submit_off : styles.submit_on} activeOpacity={.5} disabled={state.disablebutton} onPress={this.validerpanier.bind(this, navigate)}>
                          <Icon name="check" size={20} style={styles.iconValiderpanier} />
                          <Text style={styles.iconPanier}>Valider la commande</Text>
                        </TouchableOpacity>
                      </View>
                    </CardView>
                  </View>
                  )
              }
            </View>
          </View>
        </ScrollView>


        {
          state.panierData.length > 0 ?
            (
              <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', }}>
                <View style={styles.PaginationNextButtonContainer}>
                  <TouchableOpacity style={styles.CenteredSyncButton} activeOpacity={.5}
                    onPress={() => this._synclist()}>
                    <Icon name="sync" size={20} style={styles.icons} />
                  </TouchableOpacity>
                </View>
              </View>
            )
            : (<Text></Text>)
        }

      </DrawerLayoutAndroid>
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
  cardViewStyle0: {
    width: '100%',
    alignItems: 'center',

  },
  icons: {
    color: '#ffffff',
    alignItems: 'flex-end'
  },
  selectedliste: {
    alignItems: 'center',
    width: '92%',
    flexDirection: 'row',
    marginBottom: 15,
    borderColor: '#00BFA6',
    borderWidth: 1,
    borderRadius: 25,
    paddingLeft: 20,
    height: 40,
    backgroundColor: '#e9e9e9',
  },
  selectedlistedetails: {
    color: '#00BFA6',
    width: '90%',
  },
  selecteditem: {
    width: '100%',
  },
  clientnotfound: {
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d64541',
    marginBottom: 20,
  },



  cardViewStyle: {
    flexDirection: 'row',
    marginBottom: 10,
    //alignItems: 'center',
    width: '95%',
    padding: 20,
  },

  cardViewStyle2: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '95%',
    flexDirection: 'row',
  },


  submit_on: {
    backgroundColor: '#00BFA6',
    borderRadius: 25,
    height: 30,
    padding: 5,
    marginBottom: 20,
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },

  submit_off: {
    backgroundColor: '#e9e9e9',
    borderRadius: 25,
    height: 30,
    padding: 5,
    marginBottom: 20,
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  clean_on: {
    backgroundColor: '#d64541',
    borderRadius: 25,
    height: 30,
    padding: 5,
    marginBottom: 20,
    textAlign: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
  },

  clean: {
    width: '50%',

  },
  submit: {
    width: '50%'
  },

  listeproduits: {
    paddingTop: 20,
    paddingLeft: 5,
    width: '100%',
  },
  detailsproduits: {
    flexDirection: 'row',
    marginBottom: 30,

  },
  qtdetails: {
    flexDirection: 'row',
    width: '25%',
    justifyContent: 'center',
  },
  pricedetails: {
    width: '20%',
  },
  qtdetails_header: {
    width: '25%',
    alignItems: 'center',
  },
  pricedetails_header: {
    width: '20%',
    alignItems: 'center',
  },
  TarifText: {
    fontSize: 12
  },

  price: {
    //textAlign: 'center',
    position: 'absolute',
    right: 10
  },
  price_null: {
    //textAlign: 'center',
    position: 'absolute',
    right: 10,
    color: '#d64541',
  },
  qte: {
    alignItems: 'center',

  },
  details: {
    width: '40%'
  },
  productinfos: {
    flexDirection: 'row',
  },

  OptionsButtonStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#e9e0e0',
    borderRadius: 25,
    width: 300,
  },
  logo: {
    width: 130,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  icon1: {
    color: '#00BFA6',
    alignItems: 'flex-end'
  },
  iconButtons: {
  },
  circle: {
    marginRight: 20,
    //marginTop: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleplace: {
    width: 70,

  },
  SubmitButtonStylePrices: {
    backgroundColor: '#00BFA6',
    borderRadius: 50,
    width: 30,
    height: 30,
    margin: 5
  },
  iconPrices: {
    fontSize: 20,
    color: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  inputs: {
    height: 40,
    width: 50,
    borderColor: '#00BFA6',
    borderWidth: 1,
    borderRadius: 25,
    color: '#00BFA6',
    //marginBottom: 5,
    alignItems: 'center',
    textAlign: 'center',
  },
  productname: {
    color: '#00BFA6',
    fontSize: 15,
  },
  commande_type: {
    color: '#d64541',
    fontSize: 15,
  },

  /*SubmitButtonStyleCleanPanierDesabled: {
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    width: 160,
    height: 30,
    padding: 5,
    marginBottom: 20,
    flexDirection: 'row',

    textAlign: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 30,
  },
  SubmitButtonStyleCleanPanier: {
    alignItems: 'center',
    backgroundColor: '#d64541',
    borderRadius: 25,
    width: 160,
    height: 30,
    padding: 5,
    marginBottom: 20,
    flexDirection: 'row',
    textAlign: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 30,
  },

  validercommandeSubmit: {
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    width: 160,
    height: 30,
    padding: 5,
    marginBottom: 20,
    flexDirection: 'row',

    textAlign: 'center',
    justifyContent: 'center',
    //position: 'absolute',
    //right: 30,
  },
*/

  PaginationNextButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'absolute',
    bottom: 5,
    right: 10,

    backgroundColor: 'rgba(250, 250, 250, 0.8)',
    borderColor: '#00BFA6',
    borderWidth: 1,
    borderRadius: 50,
    //width: 30
  },
  PaginationUpButton: {
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 15,
    backgroundColor: '#00BFA6',
    borderRadius: 50,
    width: 60,
    height: 60,
    margin: 10,
    bottom: 0,
    zIndex: 100,
  },

  CenteredSyncButton: {
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 15,
    backgroundColor: '#00BFA6',
    borderRadius: 50,
    width: 60,
    height: 60,
    margin: 10,
    bottom: 0,
    zIndex: 100,
  },

  iconPanier: {
    fontSize: 15,
    color: '#ffffff',
    paddingRight: 8,
  },
  iconCleanpanier: {
    fontSize: 15,
    color: '#ffffff',
    paddingLeft: 8,
    paddingRight: 8,
  },
  iconValiderpanier: {
    fontSize: 15,
    color: '#ffffff',
    paddingLeft: 8,
    paddingRight: 8,
  },


  clean_view: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clean_text: {
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d64541',
    marginBottom: 20,
  },

  img: {
    width: 350,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    marginTop: 50,
  },
  icondel: {
    color: '#d64541',
    marginLeft: '10%'
  },
  productheader: {
    width: '100%'
  },
  totalprices: {
    width: '100%',
    flexDirection: 'row',
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',

  },
  pricesrow: {
    width: '40%',
    marginRight: 40,
  },
  emptyrow: {
    width: '60%',
  },
  total: {
    fontSize: 15,
    textAlign: 'right'

  },
  totalrenomination: {
    color: '#00BFA6',
    fontSize: 15,
    textAlign: 'right'
  },
  cardViewStyle1: {
    //flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    width: '95%',

  },
  SearchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 20,
  },

  SubmitButtonStyle: {
    backgroundColor: '#00BFA6',
    borderRadius: 50,
    width: 50,
    height: 50,
  },
  inputsearchclient: {
    color: '#00BFA6',
    marginLeft: 20,
    textAlign: 'left',
    borderColor: '#00BFA6',
    borderWidth: 1,
    borderRadius: 25,
    color: '#00BFA6',
    width: '80%',
    paddingLeft: 25,
  },
  iconSearch: {
    color: '#ffffff',
    textAlign: 'center',
    paddingTop: 5,
    paddingBottom: 5,
  },



});