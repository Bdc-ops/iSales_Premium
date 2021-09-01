import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, TextInput, ImageBackground, Alert, Dimensions } from 'react-native';
import RNFS, { stat } from 'react-native-fs';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Panier_navbar from '../../navbars/panier/recap_navbar';
import CardView from 'react-native-cardview';
import moment from 'moment';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
const avatar_image = require('../../res/client.png');
const IMG2 = require('../../res/loading.png');
export default class Recap extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      panierData: [],
      clientData: [],
      qt: '',
      total: '',
      total_tva: '',
      total_remise: '',
      bg_timer: null,
    };
  }



  componentDidMount() {
    let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Recap du Panier \n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    this._isMounted = true;
    db.transaction(tx => {
      tx.executeSql(`SELECT * FROM panier`, [], (tx, results) => {
        var temp = [];
        var id_client = null;
        var totalprices = 0;
        var total_tva = 0;
        var total_remise = 0;
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
          id_client = results.rows.item(0).id_client;
          totalprices += (parseFloat(results.rows.item(i).price - ((results.rows.item(i).price * results.rows.item(i).remise) / 100)) * results.rows.item(i).qt);
          //totalprices += parseFloat(results.rows.item(i).price - ((results.rows.item(i).price * results.rows.item(i).remise) / 100));
          //total_tva += parseFloat(results.rows.item(i).tva);
          //total_tva += parseFloat(((results.rows.item(i).price * results.rows.item(i).qt) / 100) * results.rows.item(i).tva);
          total_tva += parseFloat(((((results.rows.item(i).price) * results.rows.item(i).qt) / 100 )*(1-results.rows.item(i).remise / 100)) * results.rows.item(i).tva);

        }
        tx.executeSql(`SELECT * FROM clients where ref=${id_client}`, [], (tx, results) => {
          var clients = [];
          for (let i = 0; i < results.rows.length; ++i) {
            clients.push(results.rows.item(i));
          }
          this.setState({
            clientData: clients,
            panierData: temp,
            total: totalprices,
            total_tva: total_tva,
            total_remise: total_remise,
            bg_timer: 1
          });
        });
      });
    });
  }

  async valider_panier() {
    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Recap du Panier : VALIDER - data : ref client:" + this.state.clientData[0].ref + ", client email:" + this.state.clientData[0].email + ", total:" + this.state.total + ", total_tva:" + parseFloat(this.state.total_tva).toFixed(2) + ", total_ttc:" + parseFloat(this.state.total + this.state.total_tva).toFixed(2) + "\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
    this.props.navigation.navigate('Validation_commande', { ref_client: this.state.clientData[0].ref, products_table: this.state.panierData, client_email: this.state.clientData[0].email, total: this.state.total, total_tva: parseFloat(this.state.total_tva).toFixed(2), total_ttc: parseFloat(this.state.total + this.state.total_tva).toFixed(2) });
  }

  /*componentWillMount() {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
  }*/

  componentWillUnmount() {
    this._isMounted = false;
    //this.closeDB(db);
  }

  /*
  closeDB(db) {
    db.close(function () {
      console.log('database is closed ok');
    });
  }*/

  render() {
    const state = this.state;
    const { navigate } = this.props.navigation;

    return (
      <ScrollView contentContainerStyle={styles.containerMain} >
        <Panier_navbar title={navigate}></Panier_navbar>


        <View style={styles.container}>


          {
            state.bg_timer === null ?
              (<View style={styles.loading_view}>
                <Image style={styles.img} source={IMG2} />
                <Text style={styles.loading_text}>Chargement en cours ...</Text>
              </View>

              )
              :
              (<View style={styles.containerResults}>

                <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle1}>
                  <Text style={styles.detailslabel}>Informations du client</Text>
                  {
                    state.clientData.length > 0 ?
                      state.clientData.map((clientRow, j) => (
                        <View style={styles.ClientContainer} key={j}>
                          <View style={{ width: '45%', alignItems: 'center', marginRight: 20 }}>
                            <Image style={styles.avatar} source={avatar_image} />
                          </View>
                          <View style={{ width: '55%' }}>
                            <View style={{ flexDirection: 'row' }}><Text>Nom de l'entreprise :</Text><Text style={styles.texts}> {clientRow.name ? clientRow.name : '- - -'}</Text></View>
                            <View style={{ flexDirection: 'row' }}><Text>Adresse :</Text><Text style={styles.texts}> {clientRow.address ? clientRow.address : '- - -'}</Text></View>
                            <View style={{ flexDirection: 'row' }}><Text>Code postale :</Text><Text style={styles.texts}> {clientRow.zip ? clientRow.zip : '- - -'}</Text></View>
                            <View style={{ flexDirection: 'row' }}><Text>Ville :</Text><Text style={styles.texts}> {clientRow.town ? clientRow.town : '- - -'}</Text></View>
                            <View style={{ flexDirection: 'row' }}><Text>Pays :</Text><Text style={styles.texts}> {clientRow.country ? clientRow.country : '- - -'}</Text></View>
                            <View style={{ flexDirection: 'row' }}><Text>Téléphone :</Text><Text style={styles.texts}> {clientRow.phone ? clientRow.phone : '- - -'}</Text></View>
                            <View style={{ flexDirection: 'row' }}><Text>Email :</Text><Text style={styles.texts}> {clientRow.email ? clientRow.email : '- - -'}</Text></View>
                          </View>
                        </View>

                      ))
                      : (<Text></Text>)
                  }
                </CardView>

                <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle}>
                  <Text style={styles.detailslabel}>Liste des produits</Text>

                  <View style={styles.listeproduits}>
                    <View style={styles.detailsproduits}>
                      <View style={styles.circleplace}></View>
                      <View style={styles.details}><Text>Produits</Text></View>
                      <View style={styles.qtdetails_header}><Text>Qté</Text></View>
                      <View style={styles.pricedetails_header}><Text>Total</Text></View>
                    </View>

                    {
                      state.panierData.length > 0 ?
                        state.panierData.map((rowData, index) => (
                          <View key={index} style={styles.detailsproduits}>
                            <ImageBackground style={styles.circle} source={require('../../res/notfound_image.jpg')}>
                              <Image style={styles.circle} source={{ uri: 'file://' + RNFS.DocumentDirectoryPath + '/iSales_3/produits/images/' + rowData.ref + '.jpg' }} />
                            </ImageBackground>

                            <View style={styles.details}>
                              <View style={styles.productheader}>
                                <Text style={styles.productname}>{rowData.label} {rowData.type_commande === 'u' ? (<Text style={styles.commande_type}> [ Unité ]</Text>) : rowData.type_commande === 'c' ? <Text style={styles.commande_type}> [ Colis ]</Text> : rowData.type_commande === 'p' ? <Text style={styles.commande_type}> [ Palette ]</Text> : ''}</Text>
                              </View>
                              <View style={styles.productinfos}>
                                <Text style={styles.TarifText}>Prix de vente unitaire : </Text>
                                <Text style={styles.TarifText}>{(parseFloat(rowData.pvu)).toFixed(2)} € HT</Text>
                              </View>
                              <View style={styles.productinfos}>
                                <Text style={styles.TarifText}>{(parseFloat(rowData.price)).toFixed(2)} € HT</Text>
                                <Text style={styles.TarifText}> - </Text>
                                <Text style={styles.TarifText}>{(parseFloat(rowData.price_ttc)).toFixed(2)} € TTC</Text>
                              </View>
                              <View style={styles.productinfos}>
                                <Text style={styles.TarifText}>TVA : {(parseFloat(rowData.tva)).toFixed(2)} %</Text>
                              </View>
                              <View style={styles.productinfos}>
                                <Text style={styles.TarifText}>Remise : {rowData.remise ? rowData.remise + ' %' : '0 %'}</Text>
                              </View>

                            </View>
                            <View style={styles.qtdetails}>
                              <Text>{rowData.qt}</Text>
                            </View>

                            <View style={styles.pricedetails}>
                              <Text style={styles.price}>{(parseFloat(rowData.price - ((rowData.price * rowData.remise) / 100)) * rowData.qt).toFixed(2)}</Text>
                            </View>
                          </View>
                        ))
                        : (<Text></Text>)
                    }
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: 1, }} />
                    <View style={styles.totalprices}>
                      <View style={styles.emptyrow}>
                        <Text style={styles.totalrenomination}>Total HT</Text>
                        <Text style={styles.totalrenomination}>Total TVA</Text>
                        <Text style={styles.totalrenomination}>Total TTC</Text>
                      </View>
                      <View style={styles.pricesrow}>
                        <Text style={styles.total}>{parseFloat(state.total).toFixed(2)} €</Text>
                        <Text style={styles.total}>{(state.total_tva).toFixed(2)} €</Text>
                        <Text style={styles.total}>{parseFloat(state.total + state.total_tva).toFixed(2)} €</Text>



                      </View>
                    </View>
                  </View>
                </CardView>
                <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle2}>
                  <TouchableOpacity style={styles.submit_on} activeOpacity={.5} disabled={state.disablebutton} onPress={() => this.valider_panier()}>
                    <Icon name="check" size={20} style={styles.iconValiderpanier} />
                    <Text style={styles.iconPanier}>Je confirme la commande</Text>
                  </TouchableOpacity>
                </CardView>
              </View>)
          }




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
  texts: {
    color: '#00BFA6',
  },
  containerMain: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',

  },
  containerResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',

  },
  cardViewStyle0: {
    width: '100%',
    alignItems: 'center',

  },
  detailslabel: {
    color: '#00BFA6',
    fontSize: 20,
    margin: 10,
    marginLeft: 30,
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
    backgroundColor: '#e9e9e9',
  },
  selectedlistedetails: {
    height: 40,
    color: '#00BFA6',
    width: '100%',
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

  loading_text: {
    alignItems: 'center',
    justifyContent: 'center',
    color: '#00BFA6',
  },
  loading_view: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: 350,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  cardViewStyle: {
    width: '95%',
    padding: 20,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardViewStyle2: {
    width: '95%',
    padding: 20,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
  avatar: {
    margin: 20,
    width: 170,
    height: 170,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
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
  alls: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardViewStyle1: {
    width: '95%',
    padding: 20,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',


  },
  ClientContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 20,
  },

  SubmitButtonStyle: {
    margin: 25,
    padding: 10,
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