import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, TextInput, ImageBackground, Alert, Dimensions, DrawerLayoutAndroid } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Support_navbar from '../../navbars/support/support_navbar';
import CardView from 'react-native-cardview';
import NetInfo from "@react-native-community/netinfo";
import axios from 'axios';
import Toast from 'react-native-toast-native';
const disconnected = require('../../res/notfound.png');
const IMG1 = require('../../res/support.png');
import RNFS from 'react-native-fs';
import moment from 'moment';


export default class Support extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      state_connection: '',
      subject: '',
      srv: '',
      message: '',
      response: ''
    };
    NetInfo.fetch().then(state => {
      this.setState({ state_connection: state.isConnected })
    });
  }



  componentDidMount() {
    let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Support \n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }


  send_ticket() {
    if ((this.state.subject != '') && (this.state.srv != '') && (this.state.message != '')) {
      let current_date = moment().format('YYYY-MM-DD hh:mm:ss a');
      const data = { fk_project: 21, type_code: "ISSUE", category_code: "DEV", severity_code: "NORMAL", type_label: "Probléme", category_label: "Développeur", severity_label: "Normal", fk_user_assign: 33, subject: `${this.state.subject}`, message: `Client : ${this.state.srv}  - Message :  ${this.state.message}`, date_creation: current_date };
      console.log('########################################');
      console.log('Ajouter Envoie du ticket :');
      AsyncStorage.getItem('serv_name')
        .then(server => {
          AsyncStorage.getItem('user_token')
            .then(token => {
              axios(
                {
                  method: 'post',
                  url: `https://bdc.bdcloud.fr/api/index.php/tickets`,
                  headers: { 'DOLAPIKEY': '18ce2726a0357ea8da146e1024b194993bfe70ed', 'Accept': 'application/json' },
                  data: data,
                }
              )
                .then(response => {
                  if (response.status === 200) {
                    console.log(response.status);
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
                    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Support : Ticket bien envoyer :" + response.status + "\n-------";
                    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
                    Toast.show('Votre demande a bien été envoyé, notre équipe s’en occupe et vous répondra', Toast.LONG, Toast.TOP, successtoast);
                    this.props.navigation.navigate('Dashboard');

                  }
                })
                .catch(error => {
                  this.setState({ response: 'Erreur technique, veuillez vérifier votre connexion internet et réessayer plus tard' })
                  console.log(error);
                  let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Support : ERROR Ticket non envoyer :" + error + "\n-------";
                  RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
                })
            })
        });
    } else {
      this.setState({ response: 'Veuillez remplir les champs demandés' })
    }


  }



  render() {
    const state = this.state;
    const { navigate } = this.props.navigation;


    return (

      <ScrollView contentContainerStyle={styles.containerMain} >
        <Support_navbar title={navigate}></Support_navbar>


        <View style={styles.container}>
          <View>


            {
              this.state.state_connection ?

                (
                  <View style={styles.containerResults}>
                    <Image style={styles.support} source={IMG1} />

                    <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle}>

                      <View style={{ marginLeft: 20 }}>
                        <Text style={styles.label}>Sujet du ticket *</Text>

                        <TextInput style={styles.inputs} ref={input => { this.subject = input }}
                          returnKeyLabel={"next"} onChangeText={(text) => this.setState({ subject: text })} placeholder="Veuillez donner un titre à votre problématique"></TextInput>

                        <Text style={styles.label}>Adresse du serveur *</Text>

                        <TextInput style={styles.inputs} ref={input => { this.srv = input }}
                          returnKeyLabel={"next"} onChangeText={(text) => this.setState({ srv: text })} placeholder="Nom du serveur"></TextInput>


                        <Text style={styles.label}>Corp du ticket *</Text>

                        <TextInput style={styles.inputs_long} ref={input => { this.message = input }}
                          returnKeyLabel={"next"} onChangeText={(text) => this.setState({ message: text })} multiline={true} placeholder="Expliquez en détail, ce que vous faisiez avant et quand le bug est survenu ...">
                        </TextInput>



                      </View>

                      <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity style={styles.SubmitButtonStyle} activeOpacity={.5} onPress={() => this.send_ticket()}>
                          <Text style={styles.TextStyle}>Envoyer</Text>
                        </TouchableOpacity>
                        <Text style={styles.statut}>{this.state.response}</Text>

                      </View>

                    </CardView>
                  </View>

                )
                :
                (
                  <CardView cardElevation={10} cornerRadius={5} style={styles.disconnected_view}>
                    <Image style={styles.disconnected_img} source={disconnected} />
                    <Text style={styles.importantmessage}>Cette opération nécessite une connexion internet</Text>
                    <Text style={styles.importantmessage}>Veuillez verifier votre connexion</Text>

                  </CardView>
                )
            }

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

  cardViewStyle: {
    justifyContent: 'center',
    width: '90%',
    height: 450,
    marginBottom: 20,
  },
  TextStyle: {
    color: '#fff',
    textAlign: 'center',
  },
  support: {
    width: 250,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: -20,
  },
  label: {
    color: '#00BFA6',
    marginLeft: 10
  },
  inputs: {
    width: '95%',
    height: 40,
    borderColor: '#00BFA6',
    borderWidth: 1,
    borderRadius: 25,
    textAlign: 'left',
    color: '#00BFA6',
    marginBottom: 15,
    paddingLeft: 20
  },
  inputs_long: {
    width: '95%',
    height: 100,
    borderColor: '#00BFA6',
    borderWidth: 1,
    borderRadius: 25,
    textAlign: 'left',
    color: '#00BFA6',
    marginBottom: 15,
    paddingLeft: 20
  },
  statut: {
    color: '#00BFA6',
    marginTop: 20,
    alignItems: 'center',
    textAlign: 'center',
    width: '70%'
  },
  SubmitButtonStyle: {
    marginTop: 10,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#00BFA6',
    borderRadius: 25,
    width: 300,
  },
  containerResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  disconnected_view: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disconnected_img: {
    width: 350,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    marginTop: 50,
  },
  importantmessage: {
    color: '#d64541',
    marginBottom: 20,
  },



});