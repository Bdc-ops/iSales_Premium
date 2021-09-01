import React from 'react';
import { StyleSheet, View, Text,TextInput, TouchableOpacity, Image, Dimensions, ScrollView, ImageBackground,Alert } from 'react-native';
import Configuration_navbar from '../../navbars/configuration/configuration_navbar';
import CardView from 'react-native-cardview';
import AsyncStorage from '@react-native-community/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/FontAwesome5';
import RNFS, { stat } from 'react-native-fs';
import RNSmtpMailer from "react-native-smtp-mailer";
import moment from 'moment';
import Toast from 'react-native-toast-native';
import ButtonSpinner from 'react-native-button-spinner';
import DialogAndroid from 'react-native-dialogs';
import axios from 'axios';
import NetInfo from "@react-native-community/netinfo";
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });

export default class Configuration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            societe: '',
            username: '',
            serv_name: '',
            spinner: false,
            rechercheinput:'',
            pressed: 0,
            clientsliste: [],
            found: 0,
            selectedclient: [],
            disablebutton: true,
            state_connection: '',
            limit_cmd:'',
            limit_fac:'',
            limit_logs:'',
        };
        AsyncStorage.getItem('limit_cmd')
            .then(limit_cmd => {
                AsyncStorage.getItem('limit_fac')
                    .then(limit_fac => {
                        AsyncStorage.getItem('limit_logs')
                            .then(limit_logs => {
                                this.setState({
                                    limit_cmd:limit_cmd,
                                    limit_fac:limit_fac,
                                    limit_logs:limit_logs
                                })
                            });
                    });
        });
        AsyncStorage.getItem('serv_name')
            .then(serv_name => {
                AsyncStorage.getItem('societe')
                    .then(societe => {
                        AsyncStorage.getItem('username')
                            .then(username => {
                                this.setState({
                                    serv_name: serv_name,
                                    username: username,
                                    societe: societe
                                })
                            });
                    });
        });

            NetInfo.fetch().then(state => {
                this.setState({ state_connection: state.isConnected })
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
                      console.log('client : '+selectedItem.label);
                    this.setState({ selectedclient: selectedItem, disablebutton: false,rechercheinput:selectedItem.label });
                    let log_msg8 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Configuration : selectionner client :" + selectedItem.label + " \n-------";
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


    send_commandes() {
        this.setState({ spinner: true });
        console.log('----------------------------------------------------------');
        let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT : Envoie des commandes \n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
        const commandes_dir = RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/commandes/';
        RNFS.readDir(commandes_dir)
            .then((result) => {
                const att = [];
                const names = [];
                const att_filtred = [];
                const names_filtred = [];
                for (let j = 0; j < result.length; ++j) {
                    att.push({ path: result[j].path });
                    names.push({ name: result[j].name });
                }
                att.sort((a, b) => (a.path < b.path) ? 1 : -1);
                names.sort((a, b) => (a.name < b.name) ? 1 : -1);
                console.log('---');
                var lenght = 0;
                if (result.length >= 5) {
                    lenght = 4;
                } else {
                    lenght = result.length - 1;
                }
                for (let i = 0; i <= lenght; ++i) {
                    att_filtred.push(att[i].path);
                    names_filtred.push(names[i].name);
                }
                try {
                    RNSmtpMailer.sendMail({
                        mailhost: "smtp.gmail.com",
                        port: "465",
                        ssl: true,
                        username: "machine@anexys.fr",
                        password: "Rozumim1,",
                        fromName: "iSales Pro",
                        recipients: "amine@anexys.fr",
                        subject: "iSales Support - Commandes de : " + this.state.societe + "/" + this.state.username + " - [" + moment().format('YYYY-MM-DD hh:mm:ss a') + "]",
                        htmlBody: "Serveur : " + this.state.serv_name + "<br>Societe : " + this.state.societe + "<br>Utilisateur : " + this.state.username + "<br>Date d\'envoie : " + moment().format('YYYY-MM-DD hh:mm:ss a') + "<br>Nombre de commandes envoyer : " + (lenght + 1),
                        attachmentPaths: att_filtred,
                        attachmentNames: names_filtred,
                    })
                        .then(success => {
                            this.setState({ spinner: false });
                            const successtoast = {
                                backgroundColor: "#00BFA6",
                                color: "#ffffff",
                                fontSize: 15,
                                borderRadius: 50,
                                fontWeight: "bold",
                                yOffset: 500,
                                width: 800,
                                height: 200,
                            };
                            let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT : Envoie des commandes reussie\n-------";
                            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
                            Toast.show('Les commandes ont bien été envoyées', Toast.LONG, Toast.TOP, successtoast);
                        })
                        .catch(err => {
                            console.log('1 :' + err);
                            this.setState({ spinner: false });
                            alert("Erreur de connexion, veuillez verifier votre connexion internet et rééssayer ");
                            let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT : ERROR Envoie des commandes :" + err + " \n-------";
                            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
                        });
                } catch (error) {
                    this.setState({ spinner: false });
                    alert("Erreur de connexion, veuillez verifier votre connexion internet et rééssayer ");
                    console.log('2 :' + error);
                    let log_msg4 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT : ERROR Envoie des commandes :" + error + "\n-------";
                    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg4, 'utf8');
                }


            })
            .catch((err) => {
                this.setState({ spinner: false });
                alert("Aucun backup des commandes n\’est trouvé dans votre tablette ");
                console.log('3 :' + err.message, err.code);
                let log_msg5 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT : ERROR Envoie des commandes :" + err.message + " - code error :" + err.code + "\n-------";
                RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg5, 'utf8');
            });
    }


    send_logs() {
        this.setState({ spinner: true });
        console.log('----------------------------------------------------------');
        const logs_dir = RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/';
        RNFS.readDir(logs_dir)
            .then((result) => {
                let path = result[0].path;
                let name = result[0].name;
                try {
                    RNSmtpMailer.sendMail({
                        mailhost: "smtp.gmail.com",
                        port: "465",
                        ssl: true,
                        username: "machine@anexys.fr",
                        password: "Rozumim1,",
                        fromName: "iSales Pro",
                        recipients: "amine@anexys.fr",
                        subject: "iSales Support - Logs de : " + this.state.societe + "/" + this.state.username + " - [" + moment().format('YYYY-MM-DD hh:mm:ss a') + "]",
                        htmlBody: "Serveur : " + this.state.serv_name + "<br>Societe : " + this.state.societe + "<br>Utilisateur : " + this.state.username + "<br>Date d\'envoie : " + moment().format('YYYY-MM-DD hh:mm:ss a'),
                        attachmentPaths: [path],
                        attachmentNames: [name],
                    })
                        .then(success => {
                            this.setState({ spinner: false });
                            const successtoast = {
                                backgroundColor: "#00BFA6",
                                color: "#ffffff",
                                fontSize: 15,
                                borderRadius: 50,
                                fontWeight: "bold",
                                yOffset: 500,
                                width: 800,
                                height: 200,
                            };
                            Toast.show('Les logs ont bien été envoyé', Toast.LONG, Toast.TOP, successtoast);
                        })
                        .catch(err => {
                            console.log('1 :' + err);
                            this.setState({ spinner: false });
                            alert("Erreur de connexion, veuillez verifier votre connexion internet et rééssayer ");
                        });
                } catch (error) {
                    this.setState({ spinner: false });
                    alert("Erreur de connexion, veuillez verifier votre connexion internet et rééssayer ");
                    console.log('2 :' + error);
                }
            })
            .catch((err) => {
                this.setState({ spinner: false });
                alert("Aucun backup des logs n\’est trouvé dans votre tablette ");
                console.log('3 :' + err.message, err.code);
            });
    }


    async download_custom_prices(){
        if(this.state.state_connection==true){
        if(this.state.selectedclient.id){
            this.setState({ spinner: true });
        console.log('----------------------------------------------------------');
        console.log('Telechargement des prix clients');

        let log_msg55 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT : Telechargement prix clients : "+`${this.state.serv_name}/api/ryimg/product_customer_price.php?soc_id=${this.state.selectedclient.id}`;
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg55, 'utf8');

        console.log(`URL ==> ${this.state.serv_name}/api/ryimg/product_customer_price.php?soc_id=${this.state.selectedclient.id}`);
        await axios.get(`${this.state.serv_name}/api/ryimg/product_customer_price.php?soc_id=${this.state.selectedclient.id}`, { 'headers': { 'Accept': 'application/json' } })
                .then(async (response) => {
                    if (response.status === 200) {
                        var mydata = response.data;
                        var length=mydata.length;
                        let log_msg66 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT : Telechargement prix clients - status reponse : "+response.status+"DATA LENGHT : "+length;
                        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg66, 'utf8');
                        if(length>0){
                        db.transaction(async (tx) => {
                                for(var index=0;index<length;index++){
                                        await tx.executeSql(
                                            'update produits set price=?, price_ttc=?, price_min=?, price_min_ttc=?, tva_tx=? where id_produit=?',
                                            [mydata[index].price, mydata[index].price_ttc, mydata[index].price_min, mydata[index].price_min_ttc, mydata[index].tva_tx, mydata[index].fk_product],
                                            async (tx, results) => {
                                                console.log('Produit modifier');
                                                let log_msg100 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT : Produit modifier";
                                                RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg100, 'utf8');
                                            },
                                            async (tx, error) => {
                                                let log_msg101 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT : Prix client - Produit non modifier - error : "+error;
                                                RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg101, 'utf8');
                                                console.log("Could not execute query"+error);
                                            }
                                          );
                                        let log_msg88 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT : Telechargement prix clients - "+'Produit modifier : '+'update produits set price='+mydata[index].price+', price_ttc='+mydata[index].price_ttc+', price_min='+mydata[index].price_min+', price_min_ttc='+mydata[index].price_min_ttc+', tva_tx='+mydata[index].tva_tx+' where id_produit='+mydata[index].fk_product+'';
                                        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg88, 'utf8');
                                        console.log('Produit modifier : '+'update produits set price='+mydata[index].price+', price_ttc='+mydata[index].price_ttc+', price_min='+mydata[index].price_min+', price_min_ttc='+mydata[index].price_min_ttc+', tva_tx='+mydata[index].tva_tx+' where id_produit='+mydata[index].fk_product+'');
                                        if((length-1) == index){
                                            console.log('end telechargement');
                                            this.setState({ spinner: false,selectedclient:'' });
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
                                            Toast.show('Les tarifs clients ont bien été ajouter', Toast.LONG, Toast.TOP, successtoast);
                                            let log_msg99 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT : Telechargement prix clients - FIN DE TELECHARGEMENT";
                                            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg99, 'utf8');
                                        }
                                    }
                            });
                        }else{
                            let log_msg77 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT : Telechargement prix clients - Le client n\'as aucun prix différents dans la lsite des produits - LENGTH =0";
                            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg77, 'utf8');
                            this.setState({ spinner: false,selectedclient:'' });
                            const successtoast = {
                                backgroundColor: "red",
                                color: "#ffffff",
                                fontSize: 15,
                                borderRadius: 50,
                                fontWeight: "bold",
                                yOffset: 500,
                                width: 800,
                                height: 200,
                            };
                            Toast.show('Le client n\'as aucun prix différents dans la lsite des produits', Toast.LONG, Toast.TOP, successtoast);
                        }

                        }else{
                            this.setState({ spinner: false,selectedclient:'' });
                        const successtoast = {
                            backgroundColor: "red",
                            color: "#ffffff",
                            fontSize: 15,
                            borderRadius: 50,
                            fontWeight: "bold",
                            yOffset: 500,
                            width: 800,
                            height: 200,
                        };
                        Toast.show('Le service dans votre plateforme ne répond pas ou n\'est pas activé, veuillez réessayer plus tard', Toast.LONG, Toast.TOP, successtoast);
                            let log_msg114 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT : Prix clients - Error connexion API LINK - status: "+response.status;
                            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg114, 'utf8');
                        }
                    })
                    .catch(async (error) => {
                        this.setState({ spinner: false,selectedclient:'' });
                        const successtoast = {
                            backgroundColor: "red",
                            color: "#ffffff",
                            fontSize: 15,
                            borderRadius: 50,
                            fontWeight: "bold",
                            yOffset: 500,
                            width: 800,
                            height: 200,
                        };
                        Toast.show('Le service dans votre plateforme ne répond pas ou n\'est pas activé, veuillez réessayer plus tard', Toast.LONG, Toast.TOP, successtoast);
                        console.log('error serveur : '+error);
                        let log_msg102 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT - Error server : "+error;
                         RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg102, 'utf8');
                    });
            }else{
                const successtoast = {
                    backgroundColor: "red",
                    color: "#ffffff",
                    fontSize: 15,
                    borderRadius: 50,
                    fontWeight: "bold",
                    yOffset: 500,
                    width: 800,
                    height: 200,
                };
                Toast.show('Veuillez choisir un client', Toast.LONG, Toast.TOP, successtoast);
                let log_msg103 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT - prix clients : Veuillez choisir un client";
                RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg103, 'utf8');
            }
        }else{
            const successtoast = {
                backgroundColor: "red",
                color: "#ffffff",
                fontSize: 15,
                borderRadius: 50,
                fontWeight: "bold",
                yOffset: 500,
                width: 800,
                height: 200,
            };
            Toast.show('Cette opération nécessite une connexion internet', Toast.LONG, Toast.TOP, successtoast);
            let log_msg104 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT - prix clients : Cette opération nécessite une connexion internet - status : "+this.state.state_connection;
            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg104, 'utf8');
        }
    }

    apply_limites(){
        var index1=0;
        var index2=0;
        if(this.state.limit_cmd >0){
            index1+=1;
            AsyncStorage.setItem('limit_cmd', this.state.limit_cmd);
        }else{
            alert('Veuillez choisir un nombre supperieur a zero');
        }
        if(this.state.limit_fac >0){
            index2+=1;
            AsyncStorage.setItem('limit_fac', this.state.limit_fac);
        }else{
            alert('Veuillez choisir un nombre supperieur a zero');
        }
        if((index1>0)&&(index2>0)){
            const successtoast = {backgroundColor: "#00BFA6",color: "#ffffff",fontSize: 15,borderRadius: 50,fontWeight: "bold",yOffset: 500,width: 800,height: 200};
            let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : SUPPORT : Modification des limites : Commandes:"+this.state.limit_cmd+" - Factures:"+this.state.limit_fac+" \n-------";
            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
            Toast.show('Les limites ont bien été modifiées. \n\n Limite commandes : '+this.state.limit_cmd+'\n Limite factures : '+this.state.limit_fac, Toast.LONG, Toast.TOP, successtoast);
        }
    }

    apply_limite_logs(){
        if(this.state.limit_logs >0){
            AsyncStorage.setItem('limit_logs', this.state.limit_logs);
            const successtoast = {backgroundColor: "#00BFA6",color: "#ffffff",fontSize: 15,borderRadius: 50,fontWeight: "bold",yOffset: 500,width: 800,height: 200};
            Toast.show('La limite d\'écriture des logs a bien été modifiée. \n\n Limite des Logs : '+this.state.limit_logs+' Bytes', Toast.LONG, Toast.TOP, successtoast);
        }else{
            alert('Veuillez choisir un nombre supperieur a zero');
        }
    }


    clean_logs_message(){
        Alert.alert(
            "IMPORTANT",
            "Voulez-vous vraiment forcer la suppression des logs",
            [
              {
                text: "Annuler",
                style: "cancel"
              },
              {
                text: "Supprimer", onPress: () => this.clean_logs()
              }
            ],
            { cancelable: false }
          );
    }
    async clean_logs(){
        const logs_dir = RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/';
        await RNFS.readDir(logs_dir).then(async (result) => {
            await result.forEach(async (element) => {
                    console.log(" delete log");
                    await RNFS.unlink(element.path).then(async (result) => {
                      console.log("Log => ",element.path, "deleted!");
                      alert('les fichiers de logs ont bien été supprimer');
                    });
            });
          });
    }

    render() {
        const state = this.state;
        const { navigate } = this.props.navigation;
        return (

            <ScrollView contentContainerStyle={styles.containerMain} ref='_scrollView'>
                <Spinner visible={this.state.spinner} textContent={'Veuillez patienter ...'} overlayColor={'rgba(0,191,166,0.5)'} textStyle={{ color: '#ffffff' }} />

                <Configuration_navbar title={navigate}></Configuration_navbar>

                <View style={styles.container}>
                    <View style={styles.containerResults}>


                    <CardView style={styles.cards} cardElevation={5} cornerRadius={10}>
                            <Text style={styles.titles}>Prix clients</Text>
                            <Text>Pour appliquer les prix différents pour chaque client, veuillez selectionner votre client en bas :</Text>
                            <Text></Text>
                            <View style={styles.SearchContainer}>
                                <TextInput style={styles.inputsearchclient} placeholder="Selectionner un client"
                                ref={input => { this.rechercheinput = input }} onChangeText={(text) => this.setState({ rechercheinput: text })}></TextInput>
                                <ButtonSpinner positionSpinner={'centered-without-text'} styleSpinner={{ style: { textAlign: 'center', color: '#ffffff' } }}
                                onPress={this.selectionnerclient.bind(this)} style={styles.SubmitButtonStyle}>
                                <Icon name="search" size={15} color="#900" style={styles.iconSearch} />
                                </ButtonSpinner>
                                <Text></Text>
                            </View>

                            {<Text style={styles.relance} onPress={() => this.download_custom_prices()}><Icon name="funnel-dollar" size={15} style={{ color: '#ffffff' }} /> Télécharger et appliquer les prix du client {this.state.selectedclient.label?': '+this.state.selectedclient.label:''}</Text>}
                    </CardView>

                    <CardView style={styles.cards} cardElevation={5} cornerRadius={10}>
                            <Text style={styles.titles}>Limites et précisions</Text>
                            <Text></Text>
                            <View style={styles.limites_container}>
                                <Text>Nombre de commandes à télécharger lors de la synchronisation : </Text>
                                <TextInput style={styles.limites_inputs} placeholder="250" ref={input => { this.limit_cmd = input }} onChangeText={(text) => this.setState({ limit_cmd: text })}>{this.state.limit_cmd}</TextInput>
                            </View>
                            <View style={styles.limites_container}>
                            <Text>Nombre de factures à télécharger lors de la synchronisation : </Text>
                                <TextInput style={styles.limites_inputs} placeholder="250" ref={input => { this.limit_fac = input }} onChangeText={(text) => this.setState({ limit_fac: text })}>{this.state.limit_fac}</TextInput>
                            </View>


                                <Text></Text>

                            {<Text style={styles.relance} onPress={() => this.apply_limites()}><Icon name="filter" size={15} style={{ color: '#ffffff' }} /> Appliquer les limites de synchronisation</Text>}
                    </CardView>


                    <CardView style={styles.cards} cardElevation={5} cornerRadius={10}>
                            <Text style={styles.titles}>Envoyer les logs</Text>
                            <Text>Cette option vous permet d'envoyer les logs de l'application iSales au service support de "Big Data Consulting"</Text>
                            <Text></Text>
                            <Text style={styles.relance} onPress={() => this.send_logs()}><Icon name="cloud-upload-alt" size={15} style={{ color: '#ffffff' }} /> Envoyer les logs</Text>
                            <Text></Text>
                            <Text></Text>

                            <Text style={styles.titles}>Envoyer les dernières commandes</Text>
                            <Text>Cette option vous permet d’envoyer les cinq dernières commandes au service support iSales de « Big Data Consulting » </Text>
                            <Text></Text>
                            <Text style={styles.relance} onPress={() => this.send_commandes()}><Icon name="cloud-upload-alt" size={15} style={{ color: '#ffffff' }} /> Envoyer les cinq dernières commandes</Text>
                        </CardView>


                        <CardView style={styles.cards_logs} cardElevation={5} cornerRadius={10}>
                            <Text style={styles.title_logs}>Limite d'écriture des logs </Text>
                            <Text></Text>
                            <View style={styles.limites_container}>
                            <Text>Limite de taille du fichier logs généré par l'application isales </Text>
                                <TextInput style={styles.limites_input_logs} placeholder="500000" ref={input => { this.limit_logs= input }} onChangeText={(text) => this.setState({ limit_logs: text })}>{this.state.limit_logs}</TextInput><Text style={{marginLeft:5}}>Bytes</Text>
                            </View>
                            <Text>Le fichier des logs va être supprimé automatiquement quand sa taille dépasse la taille mentionnée en haut (en Bytes).</Text>
                            <Text style={{ fontWeight: 'bold' }}>La suppression du fichier de logs affectera positivement la rapidité de l'application en libérant plus d'espace...</Text>
                            <Text></Text>
                            <Text>Indice de conversion : <Text style={{ fontWeight: 'bold' }}>5000000 Bytes l'équivalent de 5 Megabytes *</Text></Text>


                                <Text></Text>

                                {<Text style={styles.relance_logs} onPress={() => this.apply_limite_logs()}><Icon name="filter" size={15} style={{ color: '#e74c3c' }} /> Appliquer les limites des logs</Text>}
                                {<Text style={styles.delete_logs} onPress={() => this.clean_logs_message()}><Icon name="trash" size={15} style={{ color: '#e74c3c' }} /> Forcer la suppression des logs</Text>}
                    </CardView>


                    </View>
                </View>
            </ScrollView>
        );
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
        flexDirection: 'column',
    },
    containerResults: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 40,
        marginBottom:15,
    },
    cards: {
        margin: 10,
        width: '95%',
        padding: 20
    },
    cards_logs:{
        margin: 10,
        width: '95%',
        padding: 20,
        backgroundColor: '#e74c3c',
    },
    titles: {
        color: '#00BFA6',
        fontSize: 22,
        marginBottom: 10,
    },
    title_logs:{
        color: '#ffffff',
        fontSize: 22,
        marginBottom: 10,
    },
    relance: {
        //position: 'absolute',
        //right: 10,
        justifyContent: 'center',
        alignItems: 'center',
        //paddingLeft: 10,
        color: '#ffffff',
        backgroundColor: '#00BFA6',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
    },
    relance_logs: {
        //position: 'absolute',
        //right: 10,
        justifyContent: 'center',
        alignItems: 'center',
        //paddingLeft: 10,
        color: '#000000',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
    },
    delete_logs:{
        justifyContent: 'center',
        alignItems: 'center',
        marginTop:10,
        color: '#000000',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
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
      SearchContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        //marginTop: 20,
      },
      limites_container:{
        //justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom:10
      },
      limites_inputs:{
        //marginLeft: 20,
        textAlign: 'left',
        borderColor: '#00BFA6',
        borderWidth: 1,
        borderRadius: 25,
        color: '#00BFA6',
        width: '15%',
        paddingLeft: 10,
      },
      limites_input_logs:{
        //marginLeft: 20,
        textAlign: 'left',
        borderColor: '#000000',
        borderWidth: 1,
        borderRadius: 25,
        color: '#e74c3c',
        width: '15%',
        paddingLeft: 10,
        backgroundColor: '#ffffff'
      },
      SubmitButtonStyle: {
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
});