import React, { Component, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, TextInput, ImageBackground, Alert, Dimensions, Button, PermissionsAndroid } from 'react-native';
import DatePicker from 'react-native-datepicker';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-community/async-storage';
import RNFS, { stat } from 'react-native-fs';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Panier_navbar from '../../navbars/panier/panier_navbar';
import CardView from 'react-native-cardview';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import moment from 'moment';
import ButtonSpinner from 'react-native-button-spinner';
import Toast from 'react-native-toast-native';
import DialogAndroid from 'react-native-dialogs';
import NetInfo from "@react-native-community/netinfo";
import Mailer from 'react-native-mail';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Pdf from 'react-native-pdf';
import axios from 'axios';
import RNSmtpMailer from "react-native-smtp-mailer";

var { width } = Dimensions.get('window');
const IMG1 = require('../../res/paniervide.png');
const avatar_image = require('../../res/avatar.png');




export default class Validation_commande extends React.Component {
  constructor(props) {
    super(props);
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
    };


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




  async send_mail() {



    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'PDF App External Storage Write Permission',
        message:
          'PDF App needs access to Storage data in your SD Card ',
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {

      /* RNSmtpMailer.sendMail({
         mailhost: "smtp.gmail.com",
         port: "465",
         ssl: true, //if ssl: false, TLS is enabled,**note:** in iOS TLS/SSL is determined automatically, so either true or false is the same
         username: "commercial@anexys.fr",
         password: "anexys1,",
         from: "commercial@anexys.fr",
         recipients: "amine.labghali@gmail.com",
         subject: "subject",
         htmlBody: "<h1>header</h1><p>body</p>",
         attachmentPaths: [
           RNFS.ExternalStorageDirectoryPath + '/Commande_33.pdf',
         ],
         attachmentNames: [
           "Commande_33.pdf"
         ], //only used in android, these are renames of original files. in ios filenames will be same as specified in path. In ios-only application, leave it empty: attachmentNames:[]
         attachmentTypes: ["pdf"]
       })
         .then(success => console.log(success))
         .catch(err => console.log(err));
 */
      /*

      const cmds_path = RNFS.ExternalStorageDirectoryPath + '/iSales_3/commandes';

      await RNFS.mkdir(cmds_path)
        .then(async (success) => {
          const options = {
            html: '<h1><b>iSales PDF 3</b></h1>',
            fileName: "Commande_33",
            directory: cmds_path,
          };
          const file = await RNHTMLtoPDF.convert(options);
          console.log('path 2 : ' + file.filePath);

*/

      //[this.state.ref_client, current_date, this.state.date_livraison, this.state.mode_reglement, this.state.acompte, 0, this.state.note_privee, 1, 0, 0, parseFloat(this.state.total), this.state.total_ttc, this.state.total_tva, 1],


      await db.transaction(async (tx) => {

        await tx.executeSql(`SELECT name,email FROM clients where ref=${this.state.ref_client}`, [], async (tx, results) => {
          this.setState({ email: results.rows.item(0).email, name_client: results.rows.item(0).name });
        });

      });









      let current_date = moment().format('YYYY-MM-DD hh:mm:ss a');

      let productlist = '';
      await this.state.prodcuts_data.map(async (rowData, index) => {
        productlist = productlist + '-------------------------------------------<br>[' + (index + 1) + '] - Ref: ' + rowData.ref + '<br> -Label: ' + rowData.label + '<br> -Prix de vente: ' + rowData.price + ' Euro.<br> -Quantité: ' + rowData.qt + '<br> -Total TTC: ' + rowData.price_ttc + ' Euro.<br>';
      });



      let mailbody = 'Bonjour Madame, Monsieur ' + this.state.name_client + '<br><br><br> Ref Client: ' + this.state.ref_client + '<br>' +
        'Date de la commande: ' + current_date + '<br>' +
        'Date de livraison: ' + this.state.date_livraison + '<br>' +
        'Mode de règlement: ' + this.state.mode_reglement + '<br>' +
        'Acompte: ' + this.state.acompte + '<br>' +
        'Total HT: ' + this.state.total + '<br>' +
        //'Total TVA: ' + this.state.total_tva + '<br>' +
        //'Total TTC: ' + this.state.total_ttc + '<br><hr><br><br>' + productlist + '-------------------------------------------<hr><br><br>Cordialement.'



        console.log('Path : ' + RNFS.ExternalStorageDirectoryPath + '/Commande_33.pdf');
      Mailer.mail({
        subject: 'test subject',
        recipients: [this.state.email],
        isHTML: true,
        body: mailbody,
      }, (error, event) => {
        if (error) {
          alert('Error', 'Could not send mail. Please send a mail to support@example.com');
        }
      });










      //});
    } else {
      alert('WRITE_EXTERNAL_STORAGE permission denied');
    }

    /*
    const client_email = this.props.navigation.getParam('client_email');
    const errortoast = {
      backgroundColor: "#d64541",
      color: "#ffffff",
      fontSize: 15,
      borderRadius: 50,
      fontWeight: "bold",
      yOffset: 200
    };
    const successtoast = {
      backgroundColor: "#00BFA6",
      color: "#ffffff",
      fontSize: 15,
      borderRadius: 50,
      fontWeight: "bold",
      yOffset: 200
    };

    NetInfo.fetch().then(async (state) => {
      if (state.isConnected) {
        if ((client_email === null) || (client_email === '') || (client_email === 0) || (client_email === '0')) {
          Toast.show('Le client ne possede pas une adresse mail', Toast.LONG, Toast.TOP, errortoast);


        } else {
          Toast.show(`La commande a bien été envoyer au client : ${client_email}`, Toast.LONG, Toast.TOP, successtoast);

        }



      } else {
        Toast.show('Cette opération nécessite une connexion internet', Toast.LONG, Toast.TOP, errortoast);

      }
    });
*/
  }

  async valider_commande() {
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

      let current_date = moment().format('YYYY-MM-DD hh:mm:ss a');
      await db.transaction(async (tx) => {
        await tx.executeSql(
          `INSERT INTO commandes_client (ref_client,date_creation,date_livraison,mode_reglement,acompte,remise_commande,note_privee,statut,billed,ref_commande,total_ht,total_ttc,total_tva,isnew) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [this.state.ref_client, current_date, this.state.date_livraison, this.state.mode_reglement, this.state.acompte, 0, this.state.note_privee, 1, 0, 0, parseFloat(this.state.total), this.state.total_ttc, this.state.total_tva, 1],
          async (tx, results) => {
            if (results.rowsAffected > 0) {
              console.log('Commande Client insered');

              await tx.executeSql(`SELECT id FROM commandes_client where ref_client=${this.state.ref_client} ORDER BY ID DESC`, [], async (tx, results) => {
                this.setState({ id_cmd: results.rows.item(0).id });
                await this.state.prodcuts_data.map(async (rowData, index) => {
                  await db.transaction(async (tx) => {
                    console.log('here 1');
                    await tx.executeSql(
                      `INSERT INTO commandes_produits (label,ref_produit,qt,price,price_ttc ,tva ,type_commande,remise_produit,id_commandes_client,pvu) values (?,?,?,?,?,?,?,?,?,?)`,
                      [rowData.label, rowData.ref, rowData.qt, rowData.price, rowData.price_ttc, rowData.tva, rowData.type_commande, rowData.remise ? rowData.remise : '0', results.rows.item(0).id, rowData.pvu],
                      async (tx, results) => {
                        console.log('here 2');

                        if (results.rowsAffected > 0) {
                          console.log('Commande produits line insered');
                          if (index === ((this.state.prodcuts_data.length) - 1)) {
                            NetInfo.fetch().then(async (state) => {
                              if (state.isConnected) { this.send_to_server(resolve); } else {
                                await db.transaction(async (tx) => {
                                  await tx.executeSql(
                                    `UPDATE commandes_client set issent=0 where id=${this.state.id_cmd}`, async (tx, results) => {
                                      if (results.rowsAffected > 0) {
                                        console.log('le state envoyer est a 0');
                                      }
                                    });
                                });
                                resolve("api ok");
                                this.setState({ message: 'La commande a bien été enregistrée localement' })
                              }
                            });
                            //Toast.show('La commande a bien été enregistrée localement', Toast.LONG, Toast.TOP, successtoast);

                            db.transaction(tx => { tx.executeSql('DELETE FROM panier'); });
                          }
                        } else {
                          console.log('Erreur system');
                        }
                      }


                    );
                  });
                });
              });


            } else {
              console.log('Erreur system');
            }

          }
        );
      });
    });
  }


  async send_to_server(resolve) {
    console.log('Uploading de la commande');
    await db.transaction(async (tx) => {
      await tx.executeSql(`SELECT * FROM commandes_client where id=${this.state.id_cmd}`, [], async (tx, results) => {

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
                url: `${this.state.srv}/api/index.php/orders`,
                headers: { 'DOLAPIKEY': this.state.token, 'Accept': 'application/json' },
                data: data_cmd,
              }
            )
              .then(async (response) => {
                if (response.status === 200) {
                  console.log('commande uploaded');

                  await axios.get(`${this.state.srv}/api/index.php/orders?sortfield=t.rowid&sortorder=DESC&limit=100&page=0`, { 'headers': { 'DOLAPIKEY': this.state.token, 'Accept': 'application/json' } })
                    .then(async (response) => {
                      if (response.status === 200) {
                        await db.transaction(async (tx) => {
                          //await tx.executeSql(`SELECT cc.*,(SELECT count(*) FROM commandes_client where isnew=1) as count,(SELECT id_produit FROM produits where produits.ref=cc.ref_produit) as id_produit FROM commandes_produits cc where cc.id_commandes_client=${results.rows.item(i).id}`, [], async (tx, results) => {
                          await tx.executeSql(`SELECT cc.*,(SELECT count(*) FROM commandes_client where isnew=1) as count,(SELECT palette_qty FROM produits where produits.ref=cc.ref_produit) as palette_qty,(SELECT colis_qty FROM produits where produits.ref=cc.ref_produit) as colis_qty,(SELECT id_produit FROM produits where produits.ref=cc.ref_produit) as id_produit,type_commande FROM commandes_produits cc where cc.id_commandes_client=${this.state.id_cmd}`, [], async (tx, results) => {

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
                                //qty: parseInt(results.rows.item(j).qt),
                                qty: qt,
                                // delete prices
                                price: parseFloat(results.rows.item(j).pvu),
                                //price: results.rows.item(j).type_commande === 'c' ? ((parseFloat(results.rows.item(j).price) * parseInt(results.rows.item(j).colis_qty)) * results.rows.item(j).qt) : results.rows.item(j).type_commande === 'p' ? (((parseFloat(results.rows.item(j).price) * parseInt(results.rows.item(j).palette_qty)) * results.rows.item(j).qt)) : (parseFloat(results.rows.item(j).price) * results.rows.item(j).qt),

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
                              //console.log(results.rows.item(j).type_commande + ' - ' + results.rows.item(j).qt + ' -c: ' + results.rows.item(j).options_colis_qty + ' - p:' + results.rows.item(j).options_palette_qty);
                              axios(
                                {
                                  method: 'post',
                                  url: `${this.state.srv}/api/index.php/orders/${response.data[i].id}/lines`,
                                  headers: { 'DOLAPIKEY': this.state.token, 'Accept': 'application/json' },
                                  data: cmd_products,
                                }
                              )
                                .then(async (response) => {
                                  if (response.status === 200) {
                                    console.log('commande produits uploaded');
                                    if (((results.rows.length) - 1) === j) {
                                      await axios.get(`${this.state.srv}/api/index.php/orders?sortfield=t.rowid&sortorder=DESC&limit=100&page=0`, { 'headers': { 'DOLAPIKEY': this.state.token, 'Accept': 'application/json' } })
                                        .then(async (response) => {
                                          if (response.status === 200) {
                                            console.log('===========================> 2 :' + response.data[i].id + ' <=============================');

                                            axios(
                                              {
                                                method: 'post',
                                                //url: `${this.state.srv}/api/index.php/orders/${response.data[i].id}/validate/1/1`,
                                                url: `${this.state.srv}/api/index.php/orders/${response.data[i].id}/validate`,
                                                headers: { 'DOLAPIKEY': this.state.token, 'Accept': 'application/json' },
                                              }
                                            ).then(async (response) => {
                                              if (response.status === 200) {
                                                console.log('commande Valider');
                                                this.setState({ message: 'Votre commande a bien été enregistrer et valider (localement et en ligne)' })

                                                resolve("api ok");
                                                await db.transaction(async (tx) => {


                                                  await tx.executeSql(

                                                    `UPDATE commandes_client set isnew=0, issent=1 where id=${this.state.id_cmd}`, async (tx, results) => {
                                                      if (results.rowsAffected > 0) {
                                                        console.log('la commande est a jour');
                                                        resolve("api ok");

                                                      }
                                                    });
                                                  if (i === ((results.rows.item(0).count) - 1)) {
                                                    console.log('end');
                                                    //this.props.navigation.navigate('DownloadingData_commandes');
                                                    resolve("api ok");

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




  render() {
    const state = this.state;
    const { navigate } = this.props.navigation;



    return (
      <ScrollView contentContainerStyle={styles.containerMain} >
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
                <View style={styles.send}>
                  <TouchableOpacity style={styles.send_on} activeOpacity={.5} onPress={() => this.send_mail()}>
                    <Icon name="paper-plane" size={20} style={styles.iconCleanpanier} />
                    <Text style={styles.iconPanier}>Envoyer par email</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.save}>
                  <ButtonSpinner style={styles.save_on} onPress={() => this.valider_commande()} positionSpinner={'centered-without-text'}
                    styleSpinner={{ color: '#ffffff' }}>
                    <Icon name="save" size={20} style={styles.iconValiderpanier} />
                    <Text style={styles.iconPanier}>Enregistrer</Text>
                  </ButtonSpinner>
                </View>
              </View>
              <View>
                <Text style={{ justifyContent: 'center', alignItems: 'center', color: 'orange', marginBottom: 20 }}>{this.state.message}</Text>
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

  send: {
    width: '50%',

  },
  save: {
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