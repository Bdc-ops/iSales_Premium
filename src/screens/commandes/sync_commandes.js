import React from 'react';
import { StyleSheet, View, Text, Image, BackHandler, ScrollView, Dimensions, Alert } from 'react-native';
import CardView from 'react-native-cardview'
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import { Spinner } from '../../Spinner';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import NetInfo from "@react-native-community/netinfo";
import Sync_commandes_navbar from '../../navbars/commandes/sync_commandes_navbar'
import moment from 'moment';
import RNFS from 'react-native-fs';

const IMG1 = require('../../res/sync_all.png');
const disconnected = require('../../res/notfound.png');
var { width } = Dimensions.get('window');


export default class sync_commandes extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      state_connection: '',
      products_list: [],
    };
  }



  componentDidMount() {
    let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Synchronisation des commandes : Synchronisation et envoie des commandes local au serveur\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    this._isMounted = true;
    NetInfo.fetch().then(state => {
      this.setState({ state_connection: state.isConnected })
    });
  }

 /* componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    var db = openDatabase({ name: 'iSalesDatabase.db' });
  }*/

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    this._isMounted = false;
    //this.closeDB(db);
  }

  closeDB(db) {
    db.close(function () {
      console.log('database is closed ok');
    });
    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Synchronisation des commandes : Couper la connexion avec la base de donnee\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
  }
  handleBackButton() {
    Alert.alert(
      "IMPORTANT",
      "Le telechargement des commandes est en cours, veuillez patienter.. ",
      [
        {
          text: "OK",
          style: "cancel"
        }
      ],
      { cancelable: false }
    );
    return true;
  }

  async _commandes(srv, token) {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    console.log('################# Synchronisation des commandes');
    await db.transaction(async (tx) => {
      await tx.executeSql(`SELECT * FROM commandes_client where issent=0 and isnew=1`, [], async (tx, res) => {
        if (res.rows.length === 0) {
          this.props.navigation.navigate('Downloading_commandes');
        }
        console.log('nbr commandes : '+res.rows.length);
        var id_cmds_br=[]

        for (let i = 0; i < res.rows.length; ++i) {
          //console.log(res.rows.item(i).ref_client);
          
          await tx.executeSql(`SELECT DISTINCT prod.ref,prod.palette_qty,prod.colis_qty,prod.id_produit, cc.*,(SELECT count(*) FROM commandes_client where issent=0 and isnew=1) as count FROM commandes_produits cc, produits prod where prod.ref=cc.ref_produit and cc.id_commandes_client=${res.rows.item(i).id}`, [], async (tx, results) => {
            var cmd_products = [];
            for (let j = 0; j < results.rows.length; ++j) {
              var qt = '';
              if (results.rows.item(j).type_commande === 'c') {
                qt = parseInt(results.rows.item(j).qt) * parseInt(results.rows.item(j).colis_qty);
              } else if (results.rows.item(j).type_commande === 'p') {
                qt = parseInt(results.rows.item(j).qt) * (parseInt(results.rows.item(j).palette_qty) * parseInt(results.rows.item(j).colis_qty));
              } else {
                qt = parseInt(results.rows.item(j).qt);
              }
              var product = {
                libelle: results.rows.item(j).label,
                product_label: results.rows.item(j).label,
                ref: results.rows.item(j).ref_produit,
                product_ref: results.rows.item(j).ref_produit,
                qty: qt,
                price: parseFloat(results.rows.item(j).pvu),
                subprice: parseFloat(results.rows.item(j).pvu),
                total_ht: parseFloat(results.rows.item(j).price),
                total_ttc: parseFloat(results.rows.item(j).price_ttc),
                total_tva: parseFloat(results.rows.item(j).tva),
                tva_tx: results.rows.item(j).tva,
                product_type: '0',
                remise_percent: results.rows.item(j).remise_produit,
                fk_product: results.rows.item(j).id_produit,
                rang: '1',
                multicurrency_total_ht: parseFloat(results.rows.item(j).price),
                multicurrency_total_tva: parseFloat(results.rows.item(j).tva),
                multicurrency_total_ttc: parseFloat(results.rows.item(j).price_ttc)
              };
              cmd_products.push(product);
            }
            


            var mode_reglement_id = '0';
            var mode_reglement_code = '0';
            if (res.rows.item(i).mode_reglement === 'Carte bancaire') {
              mode_reglement_id = '6';
              mode_reglement_code = 'CB';
            } else if (res.rows.item(i).mode_reglement === 'Chèque') {
              mode_reglement_id = '7';
              mode_reglement_code = 'CHQ';
            } else if (res.rows.item(i).mode_reglement === 'Espèces') {
              mode_reglement_id = '4';
              mode_reglement_code = 'LIQ';
            } else if (res.rows.item(i).mode_reglement === 'Prélèvement') {
              mode_reglement_id = '3';
              mode_reglement_code = 'PRE';
            } else if (res.rows.item(i).mode_reglement === 'Virement') {
              mode_reglement_id = '2';
              mode_reglement_code = 'VIR';
            }
            var date2 = moment(res.rows.item(i).date_livraison).add(1, 'day').format('YYYY-MM-DD');
            var date_c = moment(new Date().getTime()).unix();

            var data_cmd = {
              socid: res.rows.item(i).ref_client,
              mode_reglement: res.rows.item(i).mode_reglement,
              mode_reglement_id: mode_reglement_id,
              mode_reglement_code: mode_reglement_code,
              demand_reason_id: "12",
              demand_reason_code: "SRC_ISALES",
              note_private: res.rows.item(i).acompte ? "Acompte : " + res.rows.item(i).acompte + " Euro" : "Acompte : 0 Euro",
              note_public: res.rows.item(i).note_privee,
              date: date_c,
              date_commande: date_c,
              date_livraison: moment(date2, 'YYYY-MM-DD').unix(),
              lines: cmd_products
            };
            console.log('---------------------------');
            console.log('CMD : '+i);
            console.log('---------------------------');
            setTimeout(async () => {
              this.send_cmd_data(srv,token,data_cmd,res.rows.item(i).id,i,res.rows.length);
            }, 4000);
          });

          /*if(((i+1)==res.rows.length)){
            console.log('length :'+id_cmds_br.length + 'data : '+id_cmds_br);
            console.log('end');
            //this.props.navigation.navigate('Downloading_commandes');
            }*/



        }


        /*for (let i = 0; i < results.rows.length; ++i) {
          console.log('Commandes number : '+i);
          const mode_reglement_id = '0';
          const mode_reglement_code = '0';
          if (results.rows.item(i).ref_commande === '0') {
            if (results.rows.item(i).mode_reglement === 'Carte bancaire') {
              mode_reglement_id = '6';
              mode_reglement_code = 'CB';
            } else if (results.rows.item(i).mode_reglement === 'Chèque') {
              mode_reglement_id = '7';
              mode_reglement_code = 'CHQ';
            } else if (results.rows.item(i).mode_reglement === 'Espèces') {
              mode_reglement_id = '4';
              mode_reglement_code = 'LIQ';
            } else if (results.rows.item(i).mode_reglement === 'Prélèvement') {
              mode_reglement_id = '3';
              mode_reglement_code = 'PRE';
            } else if (results.rows.item(i).mode_reglement === 'Virement') {
              mode_reglement_id = '2';
              mode_reglement_code = 'VIR';
            }
            //const date1 = moment(results.rows.item(i).date_creation).add(1, 'day').format('YYYY-MM-DD');
            const date2 = moment(results.rows.item(i).date_livraison).add(1, 'day').format('YYYY-MM-DD');
            let date_c = moment(new Date().getTime()).unix();

            const data_cmd = {
              socid: results.rows.item(i).ref_client,
              mode_reglement: results.rows.item(i).mode_reglement,
              mode_reglement_id: mode_reglement_id,
              mode_reglement_code: mode_reglement_code,
              demand_reason_id: "12",
              demand_reason_code: "SRC_ISALES",
              //note_private: results.rows.item(i).acompte,
              note_private: results.rows.item(i).acompte ? "Acompte : " + results.rows.item(i).acompte + " Euro" : "Acompte : 0 Euro",
              note_public: results.rows.item(i).note_privee,
              date: date_c,
              date_commande: date_c,
              //date_livraison: moment(date2, 'YYYY-MM-DD').unix()
              date_livraison: moment(date2, 'YYYY-MM-DD').unix(),
            };
            console.log(results.rows.item(i).ref_client, moment(results.rows.item(i).date_creation, 'DD-MM-YYYY').unix(), moment(results.rows.item(i).date_livraison, 'DD-MM-YYYY').unix(), results.rows.item(i).mode_reglement, mode_reglement_code, mode_reglement_id, results.rows.item(i).acompte, results.rows.item(i).note_privee, results.rows.item(i).billed, results.rows.item(i).total_ht, results.rows.item(i).total_ttc, results.rows.item(i).total_tva);

            await axios(
              {
                method: 'post',
                url: `${srv}/api/index.php/orders`,
                headers: { 'DOLAPIKEY': token, 'Accept': 'application/json' },
                data: data_cmd,
              }
            )
              .then(async (response) => {
                if (response.status === 200) {
                  console.log('commande uploaded');
                  let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Synchronisation des commandes : commande BIEN ENVOYER au serveur\n-------";
                  RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
                  await axios.get(`${srv}/api/index.php/orders?sortfield=t.rowid&sortorder=DESC&limit=100&page=0`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                    .then(async (response) => {
                      if (response.status === 200) {
                        await db.transaction(async (tx) => {
                          await tx.executeSql(`SELECT DISTINCT prod.ref,prod.palette_qty,prod.colis_qty,prod.id_produit, cc.*,(SELECT count(*) FROM commandes_client where isnew=1) as count FROM commandes_produits cc, produits prod where prod.ref=cc.ref_produit and cc.id_commandes_client=${results.rows.item(i).id}`, [], async (tx, results) => {

                            for (let j = 0; j < results.rows.length; ++j) {
                              const qt = '';
                              if (results.rows.item(j).type_commande === 'c') {
                                qt = parseInt(results.rows.item(j).qt) * parseInt(results.rows.item(j).colis_qty);
                              } else if (results.rows.item(j).type_commande === 'p') {
                                qt = parseInt(results.rows.item(j).qt) * (parseInt(results.rows.item(j).palette_qty) * parseInt(results.rows.item(j).colis_qty));
                              } else {
                                qt = parseInt(results.rows.item(j).qt);
                              }

                              const cmd_products = {
                                fk_commande: response.data[j].id,
                                commande_id: response.data[j].id,
                                libelle: results.rows.item(j).label,
                                product_label: results.rows.item(j).label,
                                ref: results.rows.item(j).ref_produit,
                                product_ref: results.rows.item(j).ref_produit,
                                qty: qt,
                                price: parseFloat(results.rows.item(j).pvu),
                                subprice: parseFloat(results.rows.item(j).pvu),
                                total_ht: parseFloat(results.rows.item(j).price),
                                total_ttc: parseFloat(results.rows.item(j).price_ttc),
                                total_tva: parseFloat(results.rows.item(j).tva),
                                tva_tx: results.rows.item(j).tva,
                                product_type: '0',
                                remise_percent: results.rows.item(j).remise_produit,
                                fk_product: results.rows.item(j).id_produit,
                                rang: '1',
                                multicurrency_total_ht: parseFloat(results.rows.item(j).price),
                                multicurrency_total_tva: parseFloat(results.rows.item(j).tva),
                                multicurrency_total_ttc: parseFloat(results.rows.item(j).price_ttc)
                              };
                              console.log('===========================> 1 :' + response.data[i].id + ' <=============================');
                              console.log('==>' + response.data[i].id + '  -  ' + results.rows.item(j).type_commande + ' - ' + results.rows.item(j).id_produit + ' <- ' + results.rows.item(j).label, results.rows.item(j).label, results.rows.item(j).ref_produit, parseFloat(results.rows.item(j).price), parseFloat(results.rows.item(j).price_ttc), parseFloat(results.rows.item(j).tva));
                              console.log(results.rows.item(j).type_commande + ' - ' + results.rows.item(j).qt + ' -c: ' + results.rows.item(j).options_colis_qty + ' - p:' + results.rows.item(j).options_palette_qty);
                              await axios(
                                {
                                  method: 'post',
                                  url: `${srv}/api/index.php/orders/${response.data[i].id}/lines`,
                                  headers: { 'DOLAPIKEY': token, 'Accept': 'application/json' },
                                  data: cmd_products,
                                }
                              )
                                .then(async (response) => {
                                  if (response.status === 200) {
                                    console.log('commande produits uploaded');
                                    let log_msg4 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Synchronisation des commandes : Commande produits UPLOADED\n-------";
                                    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg4, 'utf8');
                                    if (((results.rows.length) - 1) === j) {
                                      await axios.get(`${srv}/api/index.php/orders?sortfield=t.rowid&sortorder=DESC&limit=100&page=0`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                                        .then(async (response) => {
                                          if (response.status === 200) {
                                            console.log('===========================> 2 :' + response.data[i].id + ' <=============================');

                                            await axios(
                                              {
                                                method: 'post',
                                                url: `${srv}/api/index.php/orders/${response.data[i].id}/validate`,
                                                headers: { 'DOLAPIKEY': token, 'Accept': 'application/json' },
                                              }
                                            ).then(async (response) => {
                                              if (response.status === 200) {
                                                console.log('commande Valider');
                                                let log_msg5 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Synchronisation des commandes : commande BIEN ENVOYER et VALIDER dans le serveur\n-------";
                                                RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg5, 'utf8');
                                                await db.transaction(async (tx) => {


                                                  await tx.executeSql(
                                                    `UPDATE commandes_client set isnew=?, issent=?`, ['0', '1'], async (tx, results) => {
                                                      if (results.rowsAffected > 0) {
                                                        console.log('la commande est a jour');
                                                      }
                                                    });
                                                  if (i === ((results.rows.item(0).count) - 1)) {
                                                    let log_msg6 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Synchronisation des commandes : Envoie des commandes en local TERMINER\n-------";
                                                    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg6, 'utf8');
                                                    console.log('end');
                                                    this.props.navigation.navigate('Downloading_commandes');
                                                  }
                                                });

                                              }
                                            });
                                          }
                                        })
                                        .catch(async (error) => {
                                          console.log(error);
                                          let log_msg7 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Synchronisation des commandes : ERROR 1 :" + error + "\n-------";
                                          RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg7, 'utf8');
                                        })
                                    }
                                  }
                                })
                                .catch(async (error) => {
                                  console.log(error);
                                  let log_msg8 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Synchronisation des commandes : ERROR envoie des lines commande:" + error + "\n-------";
                                  RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg8, 'utf8');
                                });


                            }
                          });
                        });
                      }
                    })
                    .catch(async (error) => {
                      console.log(error);
                      let log_msg9 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Synchronisation des commandes : ERROR 2 :" + error + "\n-------";
                      RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg9, 'utf8');
                    })
                }
              });

          }
        }*/
      });
    });


  }

  async send_cmd_data(srv,token,data,id_local,i,length){
    console.log('################');
    console.log(data);
    await axios(
              {
                method: 'post',
                url: `${srv}/api/index.php/orders`,
                headers: { 'DOLAPIKEY': token, 'Accept': 'application/json' },
                data: data,
              }
            )
              .then(async (re) => {
                console.log('Uploading commande status : ' + re.status);
                if (re.status === 200) {
                  console.log('commande uploaded');
                  console.log('id : >>>>'+re.data);
                  //id_cmds_br.push(re.data);
                  if(re.data){
                    setTimeout(async () => {
                      this.validation_cmds(srv,token,re.data,id_local,i,length);
                    }, 3000)
                  }else{
                    console.log('id commande not found');
                  }
                }
              })
              .catch(async (error) => {
                console.log('Uploading commande error :' + error);
              });
  }

  async validation_cmds(srv,token,id_c,id_local,i,length){
    const header ={
      'DOLAPIKEY': token,
      'Accept': 'application/json'
    };
      await axios.post(`${srv}/api/index.php/orders/${id_c}/validate`,{},{headers:header}
      ).then(async (res) => {
        if (res.status === 200) {
          console.log('Validation de la commande : '+res.status);
          setTimeout(async () => {
            this.changestatus(id_local,i,length);
          }, 3000)
        }
      })
        .catch(async (error) => {
          console.log('Validation de commande '+id_c+' - Error : '+error+` - URL : ${srv}/api/index.php/orders/${id_c}/validate`);
        });
  }

  async changestatus(id_local,i,length){
    await db.transaction(async (tx) => {
      await tx.executeSql(`UPDATE commandes_client set isnew=?, issent=? where id=?`, ['0', '1',`${id_local}`], async (tx, rs) => {
        if (rs.rowsAffected > 0) {
              console.log('Commande envoyer ete valider : ' +id_local);
              if(((i+1)==length)){
            console.log('end');
            this.props.navigation.navigate('Downloading_commandes');
            }
        }
  });
    });

  }
/*
  async _commandes(srv, token) {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    console.log('################# Synchronisation des commandes');
    await db.transaction(async (tx) => {
      await tx.executeSql(`SELECT * FROM commandes_client where issent=0`, [], async (tx, results) => {
        if (results.rows.length === 0) {
          //this.props.navigation.navigate('Downloading_commandes');
        }
        console.log('nbr commandes : '+results.rows.length);
        for (let i = 0; i < results.rows.length; ++i) {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>     '+i+'    <<<<<<<<<<<<<<<<<<<<<<<<<');
          console.log(results.rows.item(i).total_ht+' - '+results.rows.item(i).issent);
          
              //-------------------------------------------------------------------------------------
    // commande liste of products
        //select distinct prod.ref,...... to prevent sending duplicate product if there exsist on two catalogues into commande
        await tx.executeSql(`SELECT DISTINCT prod.ref,prod.palette_qty,prod.colis_qty,prod.id_produit, cc.*,(SELECT count(*) FROM commandes_client where isnew=1) as count FROM commandes_produits cc, produits prod where prod.ref=cc.ref_produit and cc.id_commandes_client=${results.rows.item(i).id}`, [], async (tx, results) => {
          let cmd_data = {};
          let cmd_products = [];
          for (let j = 0; j < results.rows.length; ++j) {
            let qt = '';
            if (results.rows.item(j).type_commande === 'c') {
              qt = parseInt(results.rows.item(j).qt) * parseInt(results.rows.item(j).colis_qty);
            } else if (results.rows.item(j).type_commande === 'p') {
              qt = parseInt(results.rows.item(j).qt) * (parseInt(results.rows.item(j).palette_qty) * parseInt(results.rows.item(j).colis_qty));
            } else {
              qt = parseInt(results.rows.item(j).qt);
            }
            const product = {
              libelle: results.rows.item(j).label,
              product_label: results.rows.item(j).label,
              ref: results.rows.item(j).ref_produit,
              product_ref: results.rows.item(j).ref_produit,
              qty: qt,
              price: parseFloat(results.rows.item(j).pvu),
              subprice: parseFloat(results.rows.item(j).pvu),
              total_ht: parseFloat(results.rows.item(j).price),
              total_ttc: parseFloat(results.rows.item(j).price_ttc),
              total_tva: parseFloat(results.rows.item(j).tva),
              tva_tx: results.rows.item(j).tva,
              product_type: '0',
              remise_percent: results.rows.item(j).remise_produit,
              fk_product: results.rows.item(j).id_produit,
              rang: '1',
              multicurrency_total_ht: parseFloat(results.rows.item(j).price),
              multicurrency_total_tva: parseFloat(results.rows.item(j).tva),
              multicurrency_total_ttc: parseFloat(results.rows.item(j).price_ttc)
            };
            cmd_products.push(product);
          }

      //-------------------------------------------------------------------------------------
      //commande informations
        await tx.executeSql(`SELECT * FROM commandes_client where id=${results.rows.item(0).id_commandes_client}`, [], async (tx, results) => {
  
          let mode_reglement_id = '0';
          let mode_reglement_code = '0';
          if (results.rows.item(0).mode_reglement === 'Carte bancaire') {
            mode_reglement_id = '6';
            mode_reglement_code = 'CB';
          } else if (results.rows.item(0).mode_reglement === 'Chèque') {
            mode_reglement_id = '7';
            mode_reglement_code = 'CHQ';
          } else if (results.rows.item(0).mode_reglement === 'Espèces') {
            mode_reglement_id = '4';
            mode_reglement_code = 'LIQ';
          } else if (results.rows.item(0).mode_reglement === 'Prélèvement') {
            mode_reglement_id = '3';
            mode_reglement_code = 'PRE';
          } else if (results.rows.item(0).mode_reglement === 'Virement') {
            mode_reglement_id = '2';
            mode_reglement_code = 'VIR';
          }
          let date2 = moment(results.rows.item(0).date_livraison).add(1, 'day').format('YYYY-MM-DD');
          let datec = moment().format('YYYY-MM-DD hh:mm:ss a');
          let date_c = moment(new Date().getTime()).unix();  
          const data_cmd = {
            socid: results.rows.item(0).ref_client,
            mode_reglement: results.rows.item(0).mode_reglement,
            mode_reglement_id: mode_reglement_id,
            mode_reglement_code: mode_reglement_code,
            demand_reason_id: "12",
            demand_reason_code: "SRC_ISALES",
            note_private: results.rows.item(0).acompte ? "Acompte : " + results.rows.item(0).acompte + " Euro" : "Acompte : 0 Euro",
            note_public: results.rows.item(0).note_privee,
            date: date_c,
            date_commande: date_c,
            date_livraison: moment(date2, 'YYYY-MM-DD').unix(),
            lines: cmd_products
          };
          console.log("-------------------------------------");
          //-------------------------------------------------------------------------------------
          // validation de la commande
          console.log('-------------');
          console.log(data_cmd);
          console.log('-------------');
          await axios(
            {
              method: 'post',
              url: `${srv}/api/index.php/orders`,
              headers: { 'DOLAPIKEY': token, 'Accept': 'application/json' },
              data: data_cmd,
            }
          )
            .then(async (response) => {
              console.log('reponse 1 : ' + response.status);
              if (response.status === 200) {
                console.log('commande uploaded');
                let log_msg18 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Synchronisation des commandes : commande BIEN ENVOYER au serveur en brouillant\n-------";
                RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg18, 'utf8');
                await axios.get(`${srv}/api/index.php/orders?sortfield=t.rowid&sortorder=DESC&limit=1&page=0`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                  .then(async (response) => {
                    if (response.status === 200) {
                      console.log('validation de la commande');
                      await axios(
                        {
                          method: 'post',
                          //url: `${this.state.srv}/api/index.php/orders/${response.data[i].id}/validate/1/1`,
                          url: `${srv}/api/index.php/orders/${response.data[0].id}/validate`,
                          headers: { 'DOLAPIKEY': token, 'Accept': 'application/json' },
                        }
                      ).then(async (response) => {
                        if (response.status === 200) {
                          console.log('commande Valider');
                          let log_msg5 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Synchronisation des commandes : commande BIEN ENVOYER et VALIDER dans le serveur\n-------";
                          RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg5, 'utf8');

                            if (i === ((results.rows.item(0).count) - 1)) {
                              let log_msg6 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Synchronisation des commandes : Envoie des commandes en local TERMINER\n-------";
                              RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg6, 'utf8');
                              console.log('end');
                              //this.props.navigation.navigate('Downloading_commandes');
                              await tx.executeSql(
                                `UPDATE commandes_client set isnew=?, issent=?`, ['0', '1'], async (tx, results) => {
                                  if (results.rowsAffected > 0) {
                                    console.log('la commande est a jour');
                                  }
                                });
                            }

                        }
                      });
                    }
                  });
              }
            });





        });
      //-------------------------------------------------------------------------------------
    });
    
        }
      });
    });


  }
*/
  //###############################################################################
  // Not used
  async _Get_commandes(srv, token) {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    await axios.get(`${srv}/api/index.php/orders?sortfield=t.rowid&sortorder=DESC&limit=100&page=0&sqlfilters=fk_statut%3D1`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
      .then(async (response) => {
        if (response.status === 200) {


          await db.transaction(async (tx) => {
            console.log("################");



            await tx.executeSql(`SELECT * FROM commandes_client where isnew=1`, [], async (tx, results) => {
              for (let i = 0; i < results.rows.length; ++i) {
                //if (results.rows.item(i).ref_commande === '0') {
                if (response.data[0].ref != null) {
                  await db.transaction(async (tx) => {
                    var text = response.data[0].ref;
                    var getPart = text.slice(-6);
                    var num = parseInt(getPart);
                    var newVal = num + (i + 1);
                    var reg = new RegExp(num);
                    var newstring = text.replace(reg, newVal);

                    await tx.executeSql(
                      `UPDATE commandes_client set ref_commande=? where id=${results.rows.item(i).id}`, [newstring], async (tx, results) => {
                        if (results.rowsAffected > 0) {
                          console.log('Commande updated');
                        } else {
                          console.log('Erreur : Veuillez synchroniser l’application puis ressayer ');
                        }

                      });
                  });

                }

              }
            });

          });


        }
      });




  }


  //###############################################################################
  _downloading_data() {
    AsyncStorage.getItem('serv_name')
      .then(server => {
        const srv = server;
        AsyncStorage.getItem('user_token')
          .then(token => {
            this._commandes(srv, token);
          });
      });
  }
  //###############################################################################

  //###############################################################################

  //###############################################################################

  render() {
    const { navigate } = this.props.navigation;

    return (

      <ScrollView contentContainerStyle={styles.containerMain} >
        <Sync_commandes_navbar title={navigate}></Sync_commandes_navbar>
        {
          this.state.state_connection ?
            (
              <View style={styles.container}>
                <Image style={styles.img} source={IMG1} />
                <Text style={styles.loading_text}>Synchronisation des commandes en cours</Text>
                <Spinner />
                {this._downloading_data()}

              </View>

            ) :
            (


              <View style={styles.container}>
                <CardView cardElevation={10} cornerRadius={5} style={styles.disconnected_view}>

                  <Image style={styles.disconnected_img} source={disconnected} />
                  <Text style={styles.importantmessage}>Cette opération nécessite une connexion internet</Text>
                  <Text style={styles.importantmessage}>Veuillez verifier votre connexion</Text>

                </CardView>
              </View>

            )

        }

      </ScrollView>



    )
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
  },
  img: {
    width: 430,
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  SubmitButtonStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#00BFA6',
    borderRadius: 25,
    width: 300,
  },
  loading_text: {
    alignItems: 'center',
    justifyContent: 'center',
    color: '#00BFA6',
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

