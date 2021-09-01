import React, { Component, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, TextInput, ImageBackground, Alert, Dimensions, Button, PermissionsAndroid } from 'react-native';
import DatePicker from 'react-native-datepicker';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-community/async-storage';
import RNFS, { stat } from 'react-native-fs';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Panier_navbar from '../../navbars/panier/validation_navbar';
import CardView from 'react-native-cardview';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import moment from 'moment';
import ButtonSpinner from 'react-native-button-spinner';
import Toast from 'react-native-toast-native';
import NetInfo from "@react-native-community/netinfo";
import Mailer from 'react-native-mail';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';

export default class Validation_commande extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      date_livraison: '',
      mode_reglement: '',
      acompte: '',
      note_privee: '',
      ref_client: this.props.navigation.getParam('ref_client'),
      prodcuts_data: this.props.navigation.getParam('products_table'),
      total: this.props.navigation.getParam('total'),
      total_tva: this.props.navigation.getParam('total_tva'),
      total_ttc: this.props.navigation.getParam('total_ttc'),
      id_cmd: '',
      token: '',
      srv: '',
      state_connection: '',
      email: '',
      name_client: '',
      message: '',
      data_products: '',
      stat_end: true,
      stat_end_sync: false,
      backup_products: '',
      spinner: false
    };

    var db = openDatabase({ name: 'iSalesDatabase.db' });

    AsyncStorage.getItem('serv_name')
      .then(server => {
        const srv = server;
        AsyncStorage.getItem('user_token')
          .then(token => {
            this.setState({ token: token, srv: srv });
          });
      });

    NetInfo.fetch().then(state => {
      this.setState({ state_connection: state.isConnected })
    });

  }


  componentDidMount() {
    let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier \n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
    this._isMounted = true;
    var db = openDatabase({ name: 'iSalesDatabase.db' });
  }
  /*componentWillMount() {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
  }*/

  componentWillUnmount() {
    this._isMounted = false;
    //this.closeDB(db);
  }
  /*componentDidUnmount() {
    this._isMounted = false;
    //this.closeDB(db);
  }*/

  closeDB(db) {
    db.close(function () {
      console.log('database is closed ok');
    });
    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : Couper la connexion avec la base de donnee\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
  }

  /*
    async send_mail() {
      var db = openDatabase({ name: 'iSalesDatabase.db' });
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'PDF App External Storage Write Permission',
          message:
            'PDF App needs access to Storage data in your SD Card ',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : Envoyer par mail\n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
        await db.transaction(async (tx) => {
  
          await tx.executeSql(`SELECT name,email FROM clients where ref=${this.state.ref_client}`, [], async (tx, results) => {
            this.setState({ email: results.rows.item(0).email, name_client: results.rows.item(0).name });
            let current_date = moment().format('YYYY-MM-DD hh:mm:ss a');
            let productlist = '';
            await this.state.prodcuts_data.map(async (rowData, index) => {
              productlist = productlist + '-------------------------------------------<br>[' + (index + 1) + '] - Ref: ' + rowData.ref + '<br> -Label: ' + rowData.label + '<br> -Prix de vente: ' + rowData.price + ' Euro.<br> -Quantité: ' + rowData.qt + '<br> -Total TTC: ' + rowData.price_ttc + ' Euro.<br>';
            });
            let mailbody = 'Bonjour Madame, Monsieur ' + this.state.name_client ? this.state.name_client : '---' + '<br><br><br> Ref Client: ' + this.state.ref_client ? this.state.ref_client : '---' + '<br>' +
              'Date de la commande: ' + current_date ? current_date : '---' + '<br>' +
                'Date de livraison: ' + this.state.date_livraison ? this.state.date_livraison : '---' + '<br>' +
                  'Mode de règlement: ' + this.state.mode_reglement ? this.state.mode_reglement : '---' + '<br>' +
                    'Acompte: ' + this.state.acompte ? this.state.acompte : '0' + ' € <br>' +
                      'Total HT: ' + this.state.total ? this.state.total : '---' + ' € <br>';
            console.log('##########################################');
            console.log('details : ' + this.state.name_client + '-' + this.state.ref_client + '-' + this.state.date_livraison + '-' + this.state.mode_reglement + '-' + this.state.acompte + '-' + this.state.total + '-' + current_date);
            console.log('corp : ' + mailbody);
            console.log('##########################################');
            /*console.log('Path : ' + RNFS.ExternalStorageDirectoryPath + '/Commande_33.pdf');
  Mailer.mail({
    subject: 'Commande venant de iSales Pro, du ' + current_date,
      recipients: [this.state.email],
        isHTML: true,
          body: mailbody + '-' + this.state.prodcuts_data,
          }, (error, event) => {
  if (error) {
    alert('Error', 'Could not send mail. Please send a mail to amine@anexys.fr');
    let log_msg4 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : ERROR d\'envoie par mail :" + error + "\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg4, 'utf8');
  }
});
let log_msg5 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : Envoie par mail a :" + this.state.email + "\n-------";
RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg5, 'utf8');
        });
      });
    } else {
  alert('WRITE_EXTERNAL_STORAGE permission denied');
  let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : ERROR autorisation : envoie par mail\n-------";
  RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
}
  }
*/
  async valider_commande() {
    this.setState({ spinner: true });
    let log_msg6 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : validation de la commande\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg6, 'utf8');
    this.setState({ stat_end_sync: true });
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    console.log('Enregistrement de la commande dans la base local');
    this.setState({ message: 'Veuillez patienter' })
    const successtoast = {
      backgroundColor: "#00BFA6",
      color: "#ffffff",
      fontSize: 15,
      borderRadius: 50,
      fontWeight: "bold",
      yOffset: 200
    };
    return new Promise(async (resolve, reject) => {
      //let current_date = moment().format('YYYY-MM-DD hh:mm:ss a');
      let current_date = moment().unix();
      
      console.log('current date :' + current_date);

      await db.transaction(async (tx) => {
        await tx.executeSql(
          `INSERT INTO commandes_client (ref_client,date_creation,date_livraison,mode_reglement,acompte,remise_commande,note_privee,statut,billed,ref_commande,total_ht,total_ttc,total_tva,isnew) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [this.state.ref_client, current_date, this.state.date_livraison, this.state.mode_reglement, this.state.acompte, 0, this.state.note_privee, 1, 0, 0, parseFloat(this.state.total), this.state.total_ttc, this.state.total_tva, 1],
          async (tx, results) => {
            if (results.rowsAffected > 0) {
              console.log('Commande Client insered');
              let log_msg7 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : Commande client INSERED - ref client:" + this.state.ref_client + ",Date livraison:" + this.state.date_livraison + ",date commande:" + current_date + "\n-------";
              RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg7, 'utf8');
              await tx.executeSql(`SELECT id FROM commandes_client where ref_client=${this.state.ref_client} ORDER BY ID DESC`, [], async (tx, results) => {
                this.setState({ id_cmd: results.rows.item(0).id });
                await this.state.prodcuts_data.map(async (rowData, index) => {
                  await db.transaction(async (tx) => {
                    await tx.executeSql(
                      `INSERT INTO commandes_produits (label,ref_produit,qt,price,price_ttc ,tva ,type_commande,remise_produit,id_commandes_client,pvu) values (?,?,?,?,?,?,?,?,?,?)`,
                      [rowData.label, rowData.ref, rowData.qt, rowData.price, rowData.price_ttc, rowData.tva, rowData.type_commande, rowData.remise ? rowData.remise : '0', results.rows.item(0).id, rowData.pvu],
                      async (tx, results) => {
                        if (results.rowsAffected > 0) {
                          let log_msg8 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : commande produit line INSERED - ref:" + rowData.ref + "\n-------";
                          RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg8, 'utf8');
                          console.log('Commande produits line insered');
                          if (index === ((this.state.prodcuts_data.length) - 1)) {
                            this.save_commande_file();
                            NetInfo.fetch().then(async (state) => {
                              if (state.isConnected) {
                                this.send_to_server(resolve, this.props.navigation);
                              } else {
                                await db.transaction(async (tx) => {
                                  await tx.executeSql(
                                    `UPDATE commandes_client set issent=0 where id=${this.state.id_cmd}`, async (tx, results) => {
                                      if (results.rowsAffected > 0) {
                                        console.log('le state envoyer est a 0');
                                      }
                                    });
                                });
                                this.setState({ spinner: false });
                                resolve("api ok");
                                this.setState({ message: 'La commande a bien été enregistrée localement' })
                                const successtoast = {
                                  backgroundColor: "#ff8b3d",
                                  color: "#ffffff",
                                  fontSize: 15,
                                  borderRadius: 50,
                                  fontWeight: "bold",
                                  yOffset: 500,
                                  width: 800,
                                  height: 200,
                                };
                                let log_msg9 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : la commande a bien été enregistrée localement\n-------";
                                RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg9, 'utf8');
                                Toast.show('La commande a bien été enregistrée localement', Toast.LONG, Toast.TOP, successtoast);
                                //this.props.navigation.navigate('Dashboard');
                                this.setState({ stat_end: false })
                                await tx.executeSql('DELETE FROM panier'); //add this to clean panier
                              }

                            });
                            //Toast.show('La commande a bien été enregistrée localement', Toast.LONG, Toast.TOP, successtoast);
                            //clean panier
                            /*db.transaction(tx => {
                              tx.executeSql('DELETE FROM panier');
                              let log_msg10 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : vider le panier\n-------";
                              RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg10, 'utf8');
                            });*/
                          }
                        } else {
                          console.log('Erreur system');
                          let log_msg11 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : ERROR commande produit line NON INSERER\n-------";
                          RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
                        }
                      }


                    );
                  });
                });
              });
            } else {
              let log_msg12 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : ERROR commande client NON INSERER\n-------";
              RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg12, 'utf8');
              console.log('Erreur system');
            }

          }
        );
      });
    });
  }

  async save_commande_file() {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    console.log('Enregistrement de la commande dans le fichier Backup');
    let log_msg13 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : Enregistrement de la commande dans le fichier Backup\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg13, 'utf8');
    //-------------------------------------------------------------------------------------
    // commande liste of products
    await db.transaction(async (tx) => {
      await tx.executeSql(`SELECT DISTINCT prod.ref,prod.palette_qty,prod.colis_qty,prod.id_produit, cc.*,(SELECT count(*) FROM commandes_client where isnew=1) as count FROM commandes_produits cc, produits prod where prod.ref=cc.ref_produit and cc.id_commandes_client=${this.state.id_cmd}`, [], async (tx, results) => {
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
        this.setState({
          backup_products: cmd_products
        })

      })
    })
    //-------------------------------------------------------------------------------------
    //commande informations
    await db.transaction(async (tx) => {
      await tx.executeSql(`SELECT * FROM commandes_client where id=${this.state.id_cmd}`, [], async (tx, results) => {

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
          lines: this.state.backup_products
        };

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Backup des commandes External Storage Write Permission',
            message:
              'iSales a besoin d’avoir accés pour faire des sauvegardes',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          const commande_dir = RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/commandes/';
          RNFS.writeFile(commande_dir + moment().format('YYYY-MM-DD--hh-mm-ss-a') + '.txt', JSON.stringify(data_cmd), 'utf8')
            .then((success) => {
              console.log('Commande enregistrer dans :' + commande_dir + moment().format('YYYY-MM-DD--hh-mm-ss-a') + '.txt');
              let log_msg14 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : Commande BIEN ENREGISTRER dans :" + commande_dir + moment().format('YYYY-MM-DD--hh-mm-ss-a') + ".txt\n-------";
              RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg14, 'utf8');
            })
            .catch((err) => {
              console.log(err.message);
              let log_msg15 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : ERROR d\'enregisterment du backup commande : " + err.messag + "\n-------";
              RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg15, 'utf8');
            });
        } else {
          let log_msg16 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : ERROR Backup de la commande non enregistrer : Vous n\'avez pas donner l\'acces a l\'application pour enresitrer les backup de la commande\n-------";
          RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg16, 'utf8');
          alert('Backup de la commande non enregistrer : Vous n\'avez pas donner l\'acces a l\'application pour enresitrer les backup de la commande');
        }




      })
    });
    //-------------------------------------------------------------------------------------
  }

  async send_to_server(resolve, navigation) {
    let log_msg17 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : Envoie de la commande au serveur\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg17, 'utf8');
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    console.log('Uploading de la commande');
    //-------------------------------------------------------------------------------------
    // commande liste of products
    await db.transaction(async (tx) => {
      //select distinct prod.ref,...... to prevent sending duplicate product if there exsist on two catalogues into commande
      await tx.executeSql(`SELECT DISTINCT prod.ref,prod.palette_qty,prod.colis_qty,prod.id_produit, cc.*,(SELECT count(*) FROM commandes_client where isnew=1) as count FROM commandes_produits cc, produits prod where prod.ref=cc.ref_produit and cc.id_commandes_client=${this.state.id_cmd}`, [], async (tx, results) => {
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
          console.log('pvu: ' + results.rows.item(j).pvu);
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
        this.setState({
          data_products: cmd_products
        })

      })
    })
    //-------------------------------------------------------------------------------------
    //commande informations
    await db.transaction(async (tx) => {
      await tx.executeSql(`SELECT * FROM commandes_client where id=${this.state.id_cmd}`, [], async (tx, results) => {

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

        console.log('date creation :' + date_c);

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
          lines: this.state.data_products
        };
        console.log(data_cmd);
        console.log("-------------------------------------");
        //-------------------------------------------------------------------------------------
        // validation de la commande
        await axios(
          {
            method: 'post',
            url: `${this.state.srv}/api/index.php/orders`,
            headers: { 'DOLAPIKEY': this.state.token, 'Accept': 'application/json' },
            data: data_cmd,
          }
        )
          .then(async (response) => {
            console.log('reponse 1 : ' + response.status);
            if (response.status === 200) {
              console.log('commande uploaded');
              let log_msg18 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : commande BIEN ENVOYER au serveur en brouillant\n-------";
              RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg18, 'utf8');
              await axios.get(`${this.state.srv}/api/index.php/orders?sortfield=t.rowid&sortorder=DESC&limit=1&page=0`, { 'headers': { 'DOLAPIKEY': this.state.token, 'Accept': 'application/json' } })
                .then(async (response) => {
                  if (response.status === 200) {
                    console.log('validation de la commande');
                    await axios(
                      {
                        method: 'post',
                        //url: `${this.state.srv}/api/index.php/orders/${response.data[i].id}/validate/1/1`,
                        url: `${this.state.srv}/api/index.php/orders/${response.data[0].id}/validate`,
                        headers: { 'DOLAPIKEY': this.state.token, 'Accept': 'application/json' },
                      }
                    ).then(async (response) => {
                      if (response.status === 200) {
                        console.log('commande Valider');
                        let log_msg19 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : Commande BIEN ENVOYER et VALIDER dans le serveur\n-------";
                        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg19, 'utf8');
                        this.setState({ message: 'Votre commande a bien été enregistré et envoyé' })
                        resolve("api ok");
                        this.setState({ spinner: false });
                        const successtoast = {
                          backgroundColor: "#ff8b3d",
                          color: "#ffffff",
                          fontSize: 15,
                          borderRadius: 50,
                          fontWeight: "bold",
                          yOffset: 500,
                          width: 800,
                          height: 200,
                        };
                        //-------------------------------------------------------------------------------------
                        await db.transaction(async (tx) => {
                          await tx.executeSql(
                            `UPDATE commandes_client set isnew=0, issent=1 where id=?`, [this.state.id_cmd], (tx, results) => {
                              if (results.rowsAffected > 0) {
                                console.log('la commande est a jour');
                                this.setState({ stat_end: false })
                                const successtoast = {
                                  backgroundColor: "#ff8b3d",
                                  color: "#ffffff",
                                  fontSize: 15,
                                  borderRadius: 50,
                                  fontWeight: "bold",
                                  yOffset: 500,
                                  width: 800,
                                  height: 200,
                                };
                                Toast.show('Votre commande a bien été enregistré et envoyé', Toast.LONG, Toast.TOP, successtoast);
                                let log_msg20 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : La commande a bien été enregistrer et envoyer (localement et en ligne)\n-------";
                                RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg20, 'utf8');
                              }
                            });
                          await tx.executeSql('DELETE FROM panier'); //add this to clean panier
                        });
                        //this.props.navigation.navigate('Dashboard');

                        /*await db.close(async function () {
                          console.log('----------------- 2 :' + this.state.stat_end);
                          //navigation.navigate('Dashboard');
                        });*/
                      }
                    })
                      .catch(error => {
                        resolve("api ok");
                        this.setState({ spinner: false });
                        let log_msg23 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : ERROR de validation de la commande :" + error + "\n-------";
                        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg23, 'utf8');
                        const successtoast = {
                          backgroundColor: "#ff8b3d",
                          color: "#ffffff",
                          fontSize: 15,
                          borderRadius: 50,
                          fontWeight: "bold",
                          yOffset: 500,
                          width: 800,
                          height: 200,
                        };
                        Toast.show('Votre commande a bien été envoyé avec un statut brouillon', Toast.LONG, Toast.TOP, successtoast);

                      });
                  }
                });
            }
          })
          .catch(error => {
            resolve("api ok");
            this.setState({ spinner: false });
            console.log('reponse 2 :' + error);
            let log_msg21 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : ERROR d\'envoie de la commande au serveur :" + error + "\n-------";
            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg21, 'utf8');
            const successtoast = {
              backgroundColor: "#ff8b3d",
              color: "#ffffff",
              fontSize: 15,
              borderRadius: 50,
              fontWeight: "bold",
              yOffset: 500,
              width: 800,
              height: 200,
            };
            Toast.show('Erreur de communication avec le serveur de votre entreprise', Toast.LONG, Toast.TOP, successtoast);
          })
      })
    });
    //-------------------------------------------------------------------------------------
  }

  dashboard_back() {
    let log_msg23 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : Terminer LE PANIER apres la validation et l'envoie\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg23, 'utf8');
    console.log('End Commande');
    this.props.navigation.navigate('Dashboard');
  }

  cancel_commande() {
    console.log('Cancel commande');
    const successtoast = {
      backgroundColor: "#ff8b3d",
      color: "#ffffff",
      fontSize: 15,
      borderRadius: 50,
      fontWeight: "bold",
      yOffset: 500,
      width: 800,
      height: 200,
    };
    let log_msg22 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Validation final du panier : FERMER LE PANIER : La commande est encore enregistrer dans le panier\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg22, 'utf8');
    Toast.show('Votre commande est dans le panier ', Toast.LONG, Toast.TOP, successtoast);
    this.props.navigation.navigate('Dashboard');

  }

  render() {
    const state = this.state;
    const { navigate } = this.props.navigation;



    return (
      <ScrollView contentContainerStyle={styles.containerMain} >
        <Spinner visible={this.state.spinner} textContent={'Veuillez patienter ...'} overlayColor={'rgba(0,191,166,0.5)'} textStyle={{ color: '#ffffff' }} />
        <Panier_navbar title={navigate}></Panier_navbar>

        <View style={styles.container}>
          <View style={styles.containerResults}>


            <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle}>
              <Text style={styles.detailslabel}>Validation de la commande</Text>
              <View style={styles.cardViewStyle0}>
                <View style={{ width: '40%' }}>
                  <Text style={styles.text}>Date de livraison</Text>
                  <Text style={styles.text}>Mode de règlement</Text>
                  <Text style={styles.text}>L'acompte</Text>
                  <Text style={styles.text}>Note privée</Text>
                </View>
                <View style={{ width: '60%' }}>

                  <DatePicker
                    style={{ width: '100%' }}
                    date={this.state.date_livraison}
                    mode="date"
                    placeholder="Selectionner une date de livraison"
                    format="YYYY-MM-DD"
                    confirmBtnText="Confirmer"
                    cancelBtnText="Annuler"
                    customStyles={{
                      dateIcon: { position: 'absolute', left: 0, top: 4, marginLeft: 0 },
                      dateInput: { marginLeft: 36, borderColor: '#00BFA6', borderWidth: 1, borderRadius: 25, height: 30 }
                    }}
                    onDateChange={(date) => { this.setState({ date_livraison: date }) }}
                  />

                  <RNPickerSelect style={styles.inputs} onValueChange={value => this.setState({ mode_reglement: value })}
                    items={[
                      { label: 'Carte bancaire', value: 'Carte bancaire' },
                      { label: 'Chèque', value: 'Chèque' },
                      { label: 'Espèces', value: 'Espèces' },
                      { label: 'Prélèvement', value: 'Prélèvement' },
                      { label: 'Virement', value: 'Virement' },
                    ]} placeholder={{
                      label: 'Mode de règlement',
                      value: null,
                      Color: 'grey',
                    }}
                  />

                  <TextInput style={styles.inputs} ref={input => { this.acompte = input }}
                    returnKeyLabel={"next"} onChangeText={(text) => this.setState({ acompte: text })} keyboardType='numeric'></TextInput>
                  <TextInput multiline maxLength={100} style={styles.input_note} ref={input => { this.note_privee = input }}
                    returnKeyLabel={"next"} onChangeText={(text) => this.setState({ note_privee: text })}></TextInput>


                </View>
              </View>


            </CardView>
            <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle2}>
              <View style={{ flexDirection: 'row' }}>
                {
                  /*
                  <View style={styles.send}>
                  <TouchableOpacity style={styles.send_on} activeOpacity={.5} onPress={() => this.send_mail()}>
                    <Icon name="paper-plane" size={20} style={styles.iconCleanpanier} />
                    <Text style={styles.iconPanier}>Envoyer par email</Text>
                  </TouchableOpacity>
                </View>
                  */
                }
                <View style={styles.save}>

                  {
                    this.state.stat_end == true ?
                      (
                        <ButtonSpinner style={styles.save_on} onPress={() => this.state.date_livraison ? this.valider_commande() : alert('Veuillez selectionner une date de livraison')} positionSpinner={'centered-without-text'}
                          styleSpinner={{ color: '#ffffff' }}>
                          <Icon name="save" size={20} style={styles.iconValiderpanier} />
                          <Text style={styles.iconPanier}>Enregistrer</Text>
                        </ButtonSpinner>
                      )
                      :
                      (
                        <TouchableOpacity style={styles.send_on} activeOpacity={.5} onPress={() => this.dashboard_back()}>
                          <Icon name="check" size={20} style={styles.iconCleanpanier} />
                          <Text style={styles.iconPanier}>Terminer</Text>
                        </TouchableOpacity>
                      )

                  }

                </View>
              </View>
              <View>
                {
                  this.state.stat_end_sync == false ?
                    (
                      <TouchableOpacity style={styles.end_button} activeOpacity={.5} onPress={() => this.cancel_commande()}>
                        <Icon name="check" size={20} style={styles.iconCleanpanier} />
                        <Text style={styles.iconPanier}>Annuler la commande</Text>
                      </TouchableOpacity>
                    )
                    :
                    (
                      <Text style={{ justifyContent: 'center', alignItems: 'center', color: 'orange', marginBottom: 20 }}>{this.state.message}</Text>
                    )
                }


              </View>
            </CardView>
          </View>
        </View>
      </ScrollView>
    );
  }
}




const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  head: { height: 40, backgroundColor: '#808B97' },

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

  },
  cardViewStyle0: {
    width: '100%',
    //alignItems: 'center',
    flexDirection: 'row',
  },
  text: { marginBottom: 24, },
  detailslabel: {
    color: '#00BFA6',
    fontSize: 20,
    margin: 10,
    marginBottom: 30,
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



  cardViewStyle: {
    width: '95%',
    padding: 20,
    marginBottom: 10,
  },

  cardViewStyle2: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '95%',
    //flexDirection: 'row',
  },


  save_on: {
    backgroundColor: '#00BFA6',
    borderRadius: 25,
    height: 40,
    padding: 5,
    marginBottom: 20,
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  send_on: {
    backgroundColor: '#00BFA6',
    borderRadius: 25,
    height: 40,
    padding: 5,
    marginBottom: 20,
    textAlign: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
  },
  end_button: {
    backgroundColor: '#bf0000',
    borderRadius: 25,
    height: 40,
    padding: 5,
    marginBottom: 20,
    textAlign: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
  },
  send: {
    width: '50%',

  },
  save: {
    width: '100%'
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
    height: 30,
    borderColor: '#00BFA6',
    borderWidth: 1,
    borderRadius: 25,
    color: '#00BFA6',
    //marginBottom: 5,
    marginBottom: 6,
    alignItems: 'center',
    textAlign: 'center',
    padding: 5,
  },

  input_note: {
    height: 100,
    borderColor: '#00BFA6',
    borderWidth: 1,
    borderRadius: 25,
    color: '#00BFA6',
    //marginBottom: 5,
    marginBottom: 6,
    padding: 6,

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
    width: '24%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyrow: {
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  total: {
    fontSize: 20,
    position: 'absolute',
    right: 0,
  },
  totalrenomination: {
    position: 'absolute',
    right: 0,
    color: '#00BFA6',
    fontSize: 15,

  },
  cardViewStyle1: {
    //flex:1,
    justifyContent: 'center',
    //alignItems: 'center',
    margin: 10,
    width: '95%',
    padding: 20,


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