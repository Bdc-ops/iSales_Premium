import React from 'react';
import { StyleSheet, View, Image, BackHandler, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import RNFS from 'react-native-fs';
import { PermissionsAndroid } from 'react-native';
import moment from 'moment';

const IMG_SRC = require('../res/bg.png');
const LOGO = require('../res/logo.png');
var styles = StyleSheet.create({
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    width: 250,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backdrop: {
    flex: 1,
    flexDirection: 'column'
  }
});
export default class Splash extends React.Component {

  componentDidMount() {
    console.log(`\n\n
    d8b   d8888b            888                        8888888b                   
    Y8P d88P  Y88b          888                        888   Y88b                 
        Y88b                888                        888    888                 
    888   Y888b     8888b   888   d88b    d8888b       888   d88P 888d888  d88b   
    888      Y88b       88b 888 d8P  Y8b 88K           8888888P   888P   d88  88b 
    888        888  d888888 888 88888888  Y8888b       888        888    888  888 
    888 Y88b  d88P 888  888 888 Y8b           X88      888        888    Y88  88P 
    888   Y8888P    Y888888 888   Y8888   88888P       888        888      Y88P   
    \n              ====================================================\n              |         Coded By M. Amine LBG (BDC Team)         |\n              | All rights reserved to Big Data Consulting (BDC) |\n              ====================================================`);

    this.create_backupdir();
    AsyncStorage.getItem('user_token')
      .then(token => {
        setTimeout(() => {
          const { navigate } = this.props.navigation;
          if (token) {
            navigate('Dashboard');
          } else {
            navigate('Login');
          }
        }, 2500);
      });

  }
  async create_backupdir() {
    //create backup commandes dir
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Permission",
          message: "swahiliPodcast needs to read storage "
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const commande_dir = RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/commandes/';
        const logs_dir = RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/';
        let opening_data = "\n#########################\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Ouverture de l\'application.\n-------";
        if ((await RNFS.exists(commande_dir)) && (await RNFS.exists(logs_dir))) {
          console.log('/iSales_Premium/Backups/commandes/ ==> Exist deja');
          console.log('/iSales_Premium/Backups/logs/ ==> Exist deja');
          RNFS.appendFile(logs_dir + 'logs.txt', opening_data, 'utf8');


        //---------------------------
        //Delete log fichier
        await RNFS.readDir(logs_dir).then(async (result) => {
          await result.forEach(async (element) => {
            var limit_logs = await AsyncStorage.getItem('limit_logs');
              if(limit_logs){
                if(element.size >=limit_logs){
                  console.log(" delete log");
                  await RNFS.unlink(element.path).then(async (result) => {
                    console.log("Log => ",element.path, "deleted!");
                  });
                }else{
                  console.log("dont delete log");
                }
              }else{
                console.log('no limit');
                let limit = 5000000;
                AsyncStorage.setItem('limit_logs', limit.toString());
              }
          });
        });
        //---------------------------




        } else {
          await RNFS.mkdir(commande_dir)
            .then(async (success) => {
              console.log('/iSales_Premium/Backups/commandes/ ==> Created')
            });
          await RNFS.mkdir(logs_dir)
            .then(async (success) => {
              RNFS.writeFile(logs_dir + 'logs.txt', opening_data, 'utf8')
              console.log('/iSales_Premium/Backups/logs/ ==> Created')
            })
        }
      } else {
        Alert.alert(
          "IMPORTANT",
          "iSales a besoin des accès à votre espace de stockage pour enregistrer les backups",
          [
            {
              text: "Annuler",
              style: "cancel"
            },
            {
              text: "Confirmer", onPress: () => this.force_acces()
            }
          ],
          { cancelable: false }
        );
        //BackHandler.exitApp();
        console.log(
          "Permission Denied!",
          "You need to give  permission to see contacts"
        );
      }
    } catch (err) {
      console.log(err);
    }
    //-------------------------
  }
  async force_acces() {
    //Force creation backup commandes dir
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Permission",
          message: "swahiliPodcast needs to read storage "
        }
      );
      const commande_dir = RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/commandes/';
      const logs_dir = RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/';
      let opening_data = "\n#########################\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Ouverture de l\'application.\n-------";
      if ((await RNFS.exists(commande_dir)) && (await RNFS.exists(logs_dir))) {
        console.log('/iSales_Premium/Backups/commandes/ ==> Exist deja')
        console.log('/iSales_Premium/Backups/logs/ ==> Exist deja')
        RNFS.appendFile(logs_dir + 'logs.txt', opening_data, 'utf8')
      } else {
        await RNFS.mkdir(commande_dir)
          .then(async (success) => {
            console.log('/iSales_Premium/Backups/commandes/ ==> Created')
          });
        await RNFS.mkdir(logs_dir)
          .then(async (success) => {
            RNFS.writeFile(logs_dir + 'logs.txt', opening_data, 'utf8')
            console.log('/iSales_Premium/Backups/logs/ ==> Created')
          })
      }
    } catch (err) {
      console.log(err);
    }
    //-------------------------
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.backgroundContainer}>
          <Image source={IMG_SRC} resizeMode='cover' style={styles.backdrop} />
        </View>
        <Image style={styles.logo} source={LOGO} />
      </View>
    );
  }
}
