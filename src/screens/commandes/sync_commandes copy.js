import React from 'react';
import { StyleSheet, View, Text, Image, Alert, ScrollView, Dimensions } from 'react-native';
import CardView from 'react-native-cardview'
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import RNFS from 'react-native-fs';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Spinner } from '../../Spinner';
import RNBackgroundDownloader from 'react-native-background-downloader';
import { bindActionCreators } from 'redux';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import NetInfo from "@react-native-community/netinfo";
import Sync_commandes_navbar from '../../navbars/commandes/sync_commandes_navbar'
import moment from 'moment';

const IMG1 = require('../../res/sync_all.png');
const disconnected = require('../../res/notfound.png');
var { width } = Dimensions.get('window');


export default class sync_commandes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      state_connection: '',
      products_list: [],
    };
    NetInfo.fetch().then(state => {
      this.setState({ state_connection: state.isConnected })
    });
  }
  //###############################################################################
  async _download_commandes(srv, token) {
    /*
        db.transaction(function (txn) {
          //########################################
          txn.executeSql('DROP TABLE IF EXISTS commandes_client', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS commandes_client(id INTEGER PRIMARY KEY AUTOINCREMENT, ref_client INT(10),(ref_commande) VARCHAR(255),date_creation VARCHAR(255),date_livraison VARCHAR(255),mode_reglement VARCHAR(255),acompte VARCHAR(255),remise_commande VARCHAR(255),note_privee VARCHAR(255),total_ht VARCHAR(255),total_ttc VARCHAR(255),total_tva VARCHAR(50), statut INT(2),billed INT(2))',
            []
          );
          console.log('commandes_client table created');
          //########################################
          txn.executeSql('DROP TABLE IF EXISTS commandes_produits', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS commandes_produits(id INTEGER PRIMARY KEY AUTOINCREMENT, label VARCHAR(255), ref_produit VARCHAR(100), qt INT(10),price VARCHAR(100),price_ttc VARCHAR(100),tva VARCHAR(100),type_commande VARCHAR(2),remise_produit VARCHAR(20), id_commandes_client INT(10))',
            []
          );
          console.log('commandes_produits table created');
          //########################################
        });
    
        console.log('#######################################"');
        console.log('Telechargement des commandes');
        let j = 0;
        let ind = 0;
    
    
    
    
    
    
        while (j <= 500) {
          await axios.get(`${srv}/api/index.php/orders?sortfield=t.rowid&sortorder=ASC&limit=50&page=${j}`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
            .then(async (response) => {
              if (response.status === 200) {
                let mydata = response.data;
                var lenght = ((mydata.length) - 1);
                const { navigate } = this.props.navigation;
                await Object.keys(mydata, ind, lenght, navigate).forEach(async function (index) {
                  await db.transaction(async function (tx) {
                    console.log('----------------------- Commande ' + mydata[index].ref + ' ----------------------- ')
                    await tx.executeSql(
                      'INSERT INTO commandes_client (ref_client,ref_commande,date_creation,date_livraison,mode_reglement,acompte,remise_commande,note_privee,total_ht,total_ttc,total_tva,statut,billed) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
                      [mydata[index].socid, mydata[index].ref, mydata[index].date_commande, mydata[index].date_livraison, mydata[index].mode_reglement, mydata[index].note_public, mydata[index].remise_percent, mydata[index].note_private, mydata[index].total_ht, mydata[index].total_ttc, mydata[index].total_tva, mydata[index].statut, mydata[index].billed]
                    );
                    console.log('Commande [' + index + '] - Ref : ' + mydata[index].ref + ' - [INSERED]');
                    await tx.executeSql(`SELECT id FROM commandes_client ORDER BY ID DESC`, [], async (tx, results) => {
                      let table = mydata[index].lines;
                      await Object.keys(table, results.rows.item(0).id, tx).forEach(async function (index) {
                        await tx.executeSql(
                          'INSERT INTO commandes_produits (label, ref_produit, qt,price,price_ttc,tva,remise_produit, id_commandes_client) VALUES (?,?,?,?,?,?,?,?)',
                          [table[index].libelle, table[index].ref, table[index].qty, table[index].total_ht, table[index].total_ttc, table[index].total_tva, table[index].remise, results.rows.item(0).id]
                        );
                        console.log('Produit [' + index + '] - Ref : ' + table[index].ref + ' - [insered]');
                      });
                    });
                    if (lenght == index) {
                      console.log('end');
                      navigate('Commandes');
                    }
                    j = j + 1;
    
                  });
    
                });
              }
            })
            .catch(async (error) => {
              j = 501;
            });
        }
    */

  }

  /*console.log(
  'ref_client: ' + results.rows.item(i).ref_client + ' - ' +
  'date_creation: ' + moment(results.rows.item(i).date_creation, 'DD-MM-YYYY').unix() + ' - ' +
  'date_livraison: ' + moment(results.rows.item(i).date_livraison, 'DD-MM-YYYY').unix() + ' - ' +
  'reglement: ' + results.rows.item(i).mode_reglement + ' - ' +
  'acompte: ' + results.rows.item(i).acompte + ' - ' +
  'remise: ' + results.rows.item(i).remise_commande + ' - ' +
  'note privee: ' + results.rows.item(i).note_privee + ' - ' +
  'facture: ' + results.rows.item(i).billed + ' - ' +
  'ref:' + newstring + ' - ' +
  'totale ht: ' + results.rows.item(i).total_ht + ' - ' +
  'totale ttc: ' + results.rows.item(i).total_ttc + ' - ' +
  'totale tva: ' + results.rows.item(i).total_tva);*/


  async _commande_products(srv, token, id, id_commande) {


  }





  async _commandes(srv, token) {
    console.log('#################');
    await db.transaction(async (tx) => {
      await tx.executeSql(`SELECT * FROM commandes_client where isnew=1`, [], async (tx, results) => {

        for (let i = 0; i < results.rows.length; ++i) {
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

            const data_cmd = {
              socid: results.rows.item(i).ref_client,
              mode_reglement: results.rows.item(i).mode_reglement,
              mode_reglement_id: mode_reglement_id,
              mode_reglement_code: mode_reglement_code,
              note_private: results.rows.item(i).acompte,
              note_public: results.rows.item(i).note_privee,
              date: moment(results.rows.item(i).date_creation, 'YYYY-MM-DD').unix(),
              date_commande: moment(results.rows.item(i).date_creation, 'YYYY-MM-DD').unix(),
              date_livraison: moment(date2, 'YYYY-MM-DD').unix()
            };
            console.log(results.rows.item(i).ref_client, moment(results.rows.item(i).date_creation, 'DD-MM-YYYY').unix(), moment(results.rows.item(i).date_livraison, 'DD-MM-YYYY').unix(), results.rows.item(i).mode_reglement, mode_reglement_code, mode_reglement_id, results.rows.item(i).acompte, results.rows.item(i).note_privee, results.rows.item(i).billed, results.rows.item(i).total_ht, results.rows.item(i).total_ttc, results.rows.item(i).total_tva);

            axios(
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

                  await axios.get(`${srv}/api/index.php/orders?sortfield=t.rowid&sortorder=DESC&limit=100&page=0`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                    .then(async (response) => {
                      if (response.status === 200) {
                        await db.transaction(async (tx) => {
                          //await tx.executeSql(`SELECT cc.*,(SELECT count(*) FROM commandes_client where isnew=1) as count,(SELECT id_produit FROM produits where produits.ref=cc.ref_produit) as id_produit FROM commandes_produits cc where cc.id_commandes_client=${results.rows.item(i).id}`, [], async (tx, results) => {
                          await tx.executeSql(`SELECT cc.*,(SELECT count(*) FROM commandes_client where isnew=1) as count,(SELECT palette_qty FROM produits where produits.ref=cc.ref_produit) as palette_qty,(SELECT colis_qty FROM produits where produits.ref=cc.ref_produit) as colis_qty,(SELECT id_produit FROM produits where produits.ref=cc.ref_produit) as id_produit,type_commande FROM commandes_produits cc where cc.id_commandes_client=${results.rows.item(i).id}`, [], async (tx, results) => {

                            for (let j = 0; j < results.rows.length; ++j) {


                              const cmd_products = {
                                fk_commande: response.data[j].id,
                                commande_id: response.data[j].id,
                                libelle: results.rows.item(j).label,
                                product_label: results.rows.item(j).label,
                                ref: results.rows.item(j).ref_produit,
                                product_ref: results.rows.item(j).ref_produit,
                                qty: results.rows.item(j).type_commande === 'c' ? (parseInt(results.rows.item(j).qt) * parseInt(results.rows.item(j).colis_qty)) : results.rows.item(j).type_commande === 'p' ? (parseInt(results.rows.item(j).qt) * parseInt(results.rows.item(j).palette_qty)) : (parseInt(results.rows.item(j).qt)),
                                price: parseFloat(results.rows.item(j).price),
                                subprice: parseFloat(results.rows.item(j).price),
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
                              console.log('==>' + response.data[i].id + '  -  ' + results.rows.item(j).id_produit + ' <- ' + results.rows.item(j).label, results.rows.item(j).label, results.rows.item(j).ref_produit, parseFloat(results.rows.item(j).price), parseFloat(results.rows.item(j).price_ttc), parseFloat(results.rows.item(j).tva));
                              axios(
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
                                    if (((results.rows.length) - 1) === j) {
                                      await axios.get(`${srv}/api/index.php/orders?sortfield=t.rowid&sortorder=DESC&limit=100&page=0`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                                        .then(async (response) => {
                                          if (response.status === 200) {
                                            console.log('===========================> 2 :' + response.data[i].id + ' <=============================');

                                            axios(
                                              {
                                                method: 'post',
                                                url: `${srv}/api/index.php/orders/${response.data[i].id}/validate/0/0`,
                                                headers: { 'DOLAPIKEY': token, 'Accept': 'application/json' },
                                              }
                                            ).then(async (response) => {
                                              if (response.status === 200) {
                                                console.log('commande Valider');
                                                await db.transaction(async (tx) => {

                                                  if (i === (results.rows.item(0).count) - 1) {
                                                    await tx.executeSql(
                                                      `UPDATE commandes_client set isnew=?`, ['0'], async (tx, results) => {
                                                        if (results.rowsAffected > 0) {
                                                          console.log('la commande est a jour');
                                                        }
                                                      });
                                                    console.log('end');
                                                    this.props.navigation.navigate('DownloadingData_commandes');
                                                  }

                                                });

                                              }
                                            });
                                          }
                                        })
                                        .catch(error => {
                                          console.log(error);
                                        })
                                    }
                                  }
                                })
                                .catch(error => {
                                  console.log(error);
                                });


                            }
                          });
                        });
                      }
                    })
                    .catch(error => {
                      console.log(error);
                    })
                }
              });

          }
        }
      });
    });


  }

  //###############################################################################
  // Not used
  async _Get_commandes(srv, token) {
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
                    //console.log(results.rows.item(i).ref_client, moment(results.rows.item(i).date_creation, 'DD-MM-YYYY').unix(), moment(results.rows.item(i).date_livraison, 'DD-MM-YYYY').unix(), results.rows.item(i).mode_reglement, results.rows.item(i).acompte, results.rows.item(i).remise_commande, results.rows.item(i).note_privee, results.rows.item(i).billed, results.rows.item(i).ref_commande, results.rows.item(i).total_ht, results.rows.item(i).total_ttc);
                    /* const data_cmd = { socid: results.rows.item(i).ref_client, date_commande: moment(results.rows.item(i).date_creation, 'DD-MM-YYYY').unix(), date_livraison: moment(results.rows.item(i).date_livraison, 'DD-MM-YYYY').unix(), mode_reglement: results.rows.item(i).mode_reglement, note_private: results.rows.item(i).acompte, remise: results.rows.item(i).remise_commande, note_public: results.rows.item(i).note_privee, billed: results.rows.item(i).billed, ref: results.rows.item(i).ref_commande, total_ht: results.rows.item(i).total_ht, total_ttc: results.rows.item(i).total_ttc, total_tva: 20 };
                     axios(
                       {
                         method: 'post',
                         url: `${srv}/api/index.php/orders`,
                         headers: { 'DOLAPIKEY': token, 'Accept': 'application/json' },
                         data:
                         {
                           socid: results.rows.item(i).ref_client,
                           date_commande: moment(results.rows.item(i).date_creation, 'DD-MM-YYYY').unix(),
                           date_livraison: moment(results.rows.item(i).date_livraison, 'DD-MM-YYYY').unix(),
                           mode_reglement: results.rows.item(i).mode_reglement,
                           note_private: results.rows.item(i).acompte,
                           remise: results.rows.item(i).remise_commande,
                           note_public: results.rows.item(i).note_privee,
                           billed: results.rows.item(i).billed,
                           ref: results.rows.item(i).ref_commande,
                           total_ht: results.rows.item(i).total_ht,
                           total_ttc: results.rows.item(i).total_ttc,
                           total_tva: 20,
                         }
                       })
                       .then(response => {
                         if (response.status === 200) {
                           console.log('commande envoyer');
                           //clear tables
                           //download all
 
                         }
                       });*/
                  });




                  /*const data_cmd = { socid: results.rows.item(i).ref_client, date_commande: moment(results.rows.item(i).date_creation, 'DD-MM-YYYY').unix(), date_livraison: moment(results.rows.item(i).date_livraison, 'DD-MM-YYYY').unix(), mode_reglement: results.rows.item(i).mode_reglement, note_private: results.rows.item(i).acompte, remise: results.rows.item(i).remise_commande, note_public: results.rows.item(i).note_privee, billed: results.rows.item(i).billed, ref: results.rows.item(i).ref_commande, total_ht: results.rows.item(i).total_ht, total_ttc: results.rows.item(i).total_ttc, total_tva: 20 };
                  axios(
                    {
                      method: 'post',
                      url: `${srv}/api/index.php/orders`,
                      headers: { 'DOLAPIKEY': token, 'Accept': 'application/json' },
                      data: data_cmd,
                    }
                  )
                    .then(response => {
                      if (response.status === 200) {
                        //clear tables
                        //download all

                      }
                    });*/




                }

              }

              /*await tx.executeSql(`SELECT * FROM commandes_client where isnew=1`, [], async (tx, results) => {
                for (let i = 0; i < results.rows.length; ++i) {
                  console.log('----------------- commande -----------------');
                  await tx.executeSql(`SELECT * FROM commandes_produits where id_commandes_client=${results.rows.item(i).id}`, [], async (tx, results) => {
                    const data_prods = null;
                    var temp = [];
                    for (let i = 0; i < results.rows.length; ++i) {
                      console.log(results.rows.item(i));
                    }

                  });

                }
              });*/

              //});






              //data_prods = { libelle: results.rows.item(i).label, ref: results.rows.item(i).ref_produit, qty: results.rows.item(i).qt, total_ht: results.rows.item(i).price, total_ttc: results.rows.item(i).price_ttc, total_tva: results.rows.item(i).tva, remise: results.rows.item(i).remise_produit };
              //this.test(data_prods);
              //console.log('libelle : ' + results.rows.item(i).label + ' - ref : ' + results.rows.item(i).ref_produit + ' - qty : ' + results.rows.item(i).qt + ' - total_ht : ' + results.rows.item(i).price + ' - total_ttc : ' + results.rows.item(i).price_ttc + ' - total_tva : ' + results.rows.item(i).tva + ' - remise : ' + results.rows.item(i).remise_produit);
              //const data_cmd = { socid: results.rows.item(i).ref_client, lines: data_prods, date_commande: moment(results.rows.item(i).date_creation, 'DD-MM-YYYY').unix(), date_livraison: moment(results.rows.item(i).date_livraison, 'DD-MM-YYYY').unix(), mode_reglement: results.rows.item(i).mode_reglement, note_private: results.rows.item(i).acompte, remise: results.rows.item(i).remise_commande, note_public: results.rows.item(i).note_privee, billed: results.rows.item(i).billed, ref: results.rows.item(i).ref_commande, total_ht: results.rows.item(i).total_ht, total_ttc: results.rows.item(i).total_ttc, total_tva: 20 };
              //console.log(data_cmd);


              /*tx.executeSql(`SELECT * FROM commandes_produits where id_commandes_client=${results.rows.item(i).id}`, [], (tx, results) => {
                for (let i = 0; i < results.rows.length; ++i) {
                  //const data_prods = { label:results.rows.item(i)., ref_produit:results.rows.item(i)., qt:results.rows.item(i)., price:results.rows.item(i)., price_ttc: results.rows.item(i)., tva:results.rows.item(i). , type_commande:results.rows.item(i)., remise_produit:results.rows.item(i)., id_commandes_client:results.rows.item(i). };
                }
              });*/









            });


            /*tx.executeSql(`SELECT * FROM commandes_produits where id_commandes_client=${results.rows.item(i).id}`, [], (tx, results) => {
              for (let i = 0; i < results.rows.length; ++i) {
                //const data_prods = { label:results.rows.item(i)., ref_produit:results.rows.item(i)., qt:results.rows.item(i)., price:results.rows.item(i)., price_ttc: results.rows.item(i)., tva:results.rows.item(i). , type_commande:results.rows.item(i)., remise_produit:results.rows.item(i)., id_commandes_client:results.rows.item(i). };
              }
            });


            const data_cmd = { socid: results.rows.item(i).ref_client, lines: data_prods, date_commande: moment(results.rows.item(i).date_creation, 'DD-MM-YYYY').unix(), date_livraison: moment(results.rows.item(i).date_livraison, 'DD-MM-YYYY').unix(), mode_reglement: results.rows.item(i).mode_reglement, note_private: results.rows.item(i).acompte, remise: results.rows.item(i).remise_commande, note_public: results.rows.item(i).note_privee, billed: results.rows.item(i).billed, ref: results.rows.item(i).ref_commande, total_ht: results.rows.item(i).total_ht, total_ttc: results.rows.item(i).total_ttc, total_tva: 20 };


            axios(
              {
                method: 'post',
                url: `${srv}/api/index.php/thirdparties`,
                headers: { 'DOLAPIKEY': token, 'Accept': 'application/json' },
                data: data_cmd,
              }
            )
              .then(response => {
                if (response.status === 200) {
                  //clear tables
                  //download all

                }
              });
              */






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
            //this._download_commandes(srv, token);
            //this._Get_commandes(srv, token);
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

