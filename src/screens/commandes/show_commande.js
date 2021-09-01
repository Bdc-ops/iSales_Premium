import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, TextInput, ImageBackground, Alert, Dimensions } from 'react-native';
import RNFS, { stat } from 'react-native-fs';
import Show_Commandes_navbar from '../../navbars/commandes/show_commande_navbar';
import CardView from 'react-native-cardview';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome5';

const avatar_image = require('../../res/client.png');
const IMG2 = require('../../res/loading.png');


export default class ShowCommande extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    const { navigation } = this.props;
    this.state = {
      data: navigation.getParam('id'),
      qt: '',
      total: '',
      bg_timer: null,
      commande_client: [],
      commande_produits: [],
      cond_reglement:'',
      mode_reglement:'',
      scroll_index:0
    };
    console.log();
  }

  componentDidMount() {
    let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Fiche de commande : voir commande id:" + this.state.data + "\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    console.log('#######################');
    this._isMounted = true;
    db.transaction(tx => {
      tx.executeSql(`SELECT cc.*,(SELECT count(*) FROM commandes_produits where commandes_produits.id_commandes_client=cc.id) as count,(SELECT name from clients where clients.ref=cc.ref_client) as clientname from commandes_client cc where cc.id=${this.state.data}`, [], (tx, results) => {
        var temp = [];
        let cond_reglement ='';
        let mode_reglement='';
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
          console.log(results.rows.item(i));
          this.testdate(results.rows.item(i).total_ttc);
        }

        results.rows.item(0).cond_reglement_code == 'RECEP' ? cond_reglement = 'A réception'
        : results.rows.item(0).cond_reglement_code == '30D' ? cond_reglement = 'Règlement à 30 jours'
        : results.rows.item(0).cond_reglement_code == '30DENDMONTH' ? cond_reglement = 'Règlement à 30 jours fin de mois'
        : results.rows.item(0).cond_reglement_code == '60D' ? cond_reglement = 'Règlement à 60 jours'
        : results.rows.item(0).cond_reglement_code == '60DENDMONTH' ? cond_reglement = 'Règlement à 60 jours fin de mois'
        : results.rows.item(0).cond_reglement_code == 'PT_ORDER' ? cond_reglement = 'À réception de commande'
        : results.rows.item(0).cond_reglement_code == 'PT_DELIVERY' ? cond_reglement = 'Règlement à la livraison'
        : results.rows.item(0).cond_reglement_code == 'PT_5050' ? cond_reglement = 'Règlement 50% d\'avance, 50% à la livraison'
        : results.rows.item(0).cond_reglement_code == '10D' ? cond_reglement = '10 jours'
        : results.rows.item(0).cond_reglement_code == '10DENDMONTH' ? cond_reglement = 'Sous 10 jours suivant la fin du mois'
        : results.rows.item(0).cond_reglement_code == '14D' ? cond_reglement = '14 jours'
        : results.rows.item(0).cond_reglement_code == '14DENDMONTH' ? cond_reglement = 'Sous 14 jours suivant la fin du mois'
        : cond_reglement = '----'


        results.rows.item(0).mode_reglement == 'CB' ? mode_reglement = 'Carte bancaire'
        : results.rows.item(0).mode_reglement == 'CHQ' ? mode_reglement = 'Chèque'
        : results.rows.item(0).mode_reglement == 'FAC' ? mode_reglement = 'Facteur'
        : results.rows.item(0).mode_reglement == 'LCR' ? mode_reglement = 'LCR'
        : results.rows.item(0).mode_reglement == 'LIQ' ? mode_reglement = 'Espèce'
        : results.rows.item(0).mode_reglement == 'PRE' ? mode_reglement = 'Ordre de prélèvement'
        : results.rows.item(0).mode_reglement == 'TIP' ? mode_reglement = 'TIP (Titre interbancaire de paiement)'
        : results.rows.item(0).mode_reglement == 'TRA' ? mode_reglement = 'Traite'
        : results.rows.item(0).mode_reglement == 'VAD' ? mode_reglement = 'Paiement en ligne'
        : results.rows.item(0).mode_reglement == 'VIR' ? mode_reglement = 'Virement bancaire'
        : mode_reglement = '----'
        this.setState({
          commande_client: temp,
          cond_reglement:cond_reglement,
          mode_reglement:mode_reglement
        });

        tx.executeSql(`SELECT * from commandes_produits where id_commandes_client=${this.state.data}`, [], (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
            console.log(results.rows.item(i));
          }
          this.setState({
            commande_produits: temp,
            bg_timer: 1,
          });
        });
      });
    });

  }
  /*componentWillMount() {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
  }*/
  componentWillUnmount() {
    this._isMounted = false;
    this.closeDB(db);
  }

  closeDB(db) {
    db.close(function () {
      console.log('database is closed ok');
    });
    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Fiche commande : Couper la connexion avec la base de donnee\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
  }

  testdate(total) {
    console.log('total ======> ' + parseFloat(total));
  }

  render() {
    const state = this.state;
    const { navigate } = this.props.navigation;

    return (
      <View style={{    flexGrow: 1,justifyContent: 'center',backgroundColor: '#ffffff',}}>
      <ScrollView ref='_scrollView' contentContainerStyle={styles.containerMain}>
        <Show_Commandes_navbar title={navigate}></Show_Commandes_navbar>
        

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

                <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle1} >
                  <Text style={styles.detailslabel}>Détails de la commande</Text>
                  {
                    state.commande_client.length > 0 ?
                      state.commande_client.map((clientRow, j) => (
                        <View key={j} style={styles.ClientContainer} key={j}>
                          <View style={{ width: '40%', alignItems: 'center', marginRight: 20 }}>
                            <Image style={styles.avatar} source={avatar_image} />
                          </View>
                          <View style={{ width: '60%' }}>
                            <View style={{ flexDirection: 'row' }}><Text>Client :</Text><Text style={styles.texts}> {clientRow.clientname ? clientRow.clientname : '- - -'}</Text></View>
                            <View style={{ flexDirection: 'row' }}><Text>Ref commande :</Text><Text style={styles.texts}> {clientRow.ref_commande && clientRow.ref_commande != 0 ? clientRow.ref_commande : clientRow.ref_commande === '0' ? 'Nouvelle commande' : '- - -'}</Text></View>
                            <View style={{ flexDirection: 'row' }}><Text>Date de création :</Text><Text style={styles.texts}>
                              {
                               /*moment(clientRow.date_creation, 'YYYY-MM-DD hh:mm:ss a').unix() ? 
                                    moment(clientRow.date_creation, 'YYYY-MM-DD hh:mm:ss a').format('DD-MM-YYYY')
                                    :moment(new Date(clientRow.date_creation * 1000)).format('DD-MM-YYYY')*/

                                    clientRow.date_creation ?
                                    moment(new Date(clientRow.date_creation * 1000)).format('DD-MM-YYYY')
                                    :'----'
                                    
                              }

                            </Text></View>
                            <View style={{ flexDirection: 'row' }}><Text>Date de livraison :</Text><Text style={styles.texts}>
                              {
                                /*moment(clientRow.date_livraison, 'YYYY-MM-DD hh:mm:ss a').unix() ? 
                                    moment(clientRow.date_livraison, 'YYYY-MM-DD hh:mm:ss a').format('DD-MM-YYYY')
                                    :moment(new Date(clientRow.date_livraison * 1000)).format('DD-MM-YYYY')*/
                                    
                                    
                                    clientRow.date_livraison ?
                                      moment(clientRow.date_livraison, 'YYYY-MM-DD hh:mm:ss a').unix() ? 
                                      moment(clientRow.date_livraison, 'YYYY-MM-DD hh:mm:ss a').format('DD-MM-YYYY')
                                      : moment(new Date(clientRow.date_livraison * 1000)).format('DD-MM-YYYY')
                                    :'-----'

                                    

                              }
                            </Text></View>
                            <View style={{ flexDirection: 'row' }}><Text>Conditions de règlement :</Text><Text style={styles.texts} numberOfLines={2}> {this.state.cond_reglement ? this.state.cond_reglement : '- - -'}</Text></View>
                            <View style={{ flexDirection: 'row' }}><Text>Mode de règlement :</Text><Text style={styles.texts} numberOfLines={2}> {this.state.mode_reglement ? this.state.mode_reglement : '- - -'}</Text></View>
                            <View style={{ flexDirection: 'row' }}><Text>Nombre de produits :</Text><Text style={styles.texts}> {clientRow.count ? clientRow.count : '- - -'}</Text></View>
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
                      state.commande_produits.length > 0 ?
                        state.commande_produits.map((rowData, index) => (
                          <View key={index} style={styles.detailsproduits}>
                            <ImageBackground style={styles.circle} source={require('../../res/notfound_image.jpg')}>
                              <Image style={styles.circle} source={{ uri: 'file://' + RNFS.DocumentDirectoryPath + '/iSales_3/produits/images/' + rowData.ref_produit + '.jpg' }} />
                            </ImageBackground>

                            <View style={styles.details}>
                              <View style={styles.productheader}>
                                <Text style={styles.productname}>{rowData.label} {rowData.type_commande === 'u' ? (<Text style={styles.commande_type}> [ Unité ]</Text>) : rowData.type_commande === 'c' ? <Text style={styles.commande_type}> [ Colis ]</Text> : rowData.type_commande === 'p' ? <Text style={styles.commande_type}> [ Palette ]</Text> : ''}</Text>
                              </View>
                              <View style={styles.productinfos}>
                                <Text style={styles.TarifText}>Prix de vente : </Text>
                                <Text style={styles.TarifText}>{(parseFloat(rowData.pvu)).toFixed(2)} € HT</Text>
                              </View>
                              <View style={styles.productinfos}>
                                <Text style={styles.TarifText}>TVA : {(parseFloat(rowData.tva)).toFixed(2)} %</Text>
                              </View>
                              <View style={styles.productinfos}>
                                <Text style={styles.TarifText}>Remise : {rowData.remise_produit ? rowData.remise_produit + ' %' : '0 %'}</Text>
                              </View>

                            </View>
                            <View style={styles.qtdetails}>
                              <Text>{rowData.qt}</Text>
                            </View>

                            <View style={styles.pricedetails}>
                              {/*<Text style={styles.price}>{(parseFloat(rowData.price - ((rowData.price * rowData.remise_produit) / 100)) * rowData.qt).toFixed(2)}</Text> */}
                              <Text style={styles.price}>{(parseFloat(rowData.price - ((rowData.price * rowData.remise_produit) / 100)) * rowData.qt).toFixed(2)}</Text>
                            </View>
                          </View>
                        ))
                        : (<Text></Text>)
                    }
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: 1, }} />
                    {
                      state.commande_client.map((rowData, index) => (
                        <View key={index} style={styles.totalprices}>
                          <View style={styles.emptyrow}>
                            <Text style={styles.totalrenomination}>Montant HT</Text>
                            <Text style={styles.totalrenomination}>Total TVA</Text>
                            <Text style={styles.totalrenomination}>Total TTC</Text>
                            {/*<Text style={styles.totalrenomination}>Acompte</Text>
                            <Text style={styles.totalrenomination}>Total TTC</Text>*/}
                          </View>
                          <View style={styles.pricesrow}>
                            <Text style={styles.total}>{parseFloat(rowData.total_ht).toFixed(2)} €</Text>
                            <Text style={styles.total}>{parseFloat(rowData.total_tva).toFixed(2)} €</Text>
                            <Text style={styles.total}>{parseFloat(rowData.total_ttc).toFixed(2)} €</Text>
                            {/*<Text style={styles.total}>{rowData.acompte ? parseFloat(rowData.acompte).toFixed(2) : '0'} €</Text>
                            <Text style={styles.total}>{parseFloat((rowData.total_ttc) - rowData.acompte).toFixed(2)} €</Text>*/}
                          </View>
                        </View>
                      ))
                    }

                  </View>
                </CardView>
              </View>)
          }

        </View>
        </ScrollView>

        {
          state.bg_timer === 1 ?
            (
              <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', }}>
                <View style={styles.PaginationNextButtonContainer}>
                  <TouchableOpacity style={styles.PaginationUpButton} activeOpacity={.5}
                    onPress={() => { this.refs._scrollView.scrollTo({ x: 0, y: 0, animated: true }); }}>
                    <Icon name="arrow-up" size={20} style={styles.icons} />
                  </TouchableOpacity>
                </View>
              </View>
            )
            : (<Text></Text>)
        }
      </View>
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
  PaginationNextButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'absolute',
    bottom: 5,
    left: 10,
    backgroundColor: 'rgba(250, 250, 250, 0.8)',
    borderColor: '#00BFA6',
    borderWidth: 1,
    borderRadius: 50,
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