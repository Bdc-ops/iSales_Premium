import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import { Spinner } from '../../Spinner';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import RNFS from 'react-native-fs';
import moment from 'moment';
const IMG1 = require('../../res/sync_all.png');

export default class DownloadingData_commandes extends React.Component {

    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            progress:'',
            index:0,
        };
    }
    componentDidMount() {
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        this._isMounted = true;
        db.transaction(function (txn) {
            //########################################
            txn.executeSql('DROP TABLE IF EXISTS commandes_client', []);
            txn.executeSql(
                'CREATE TABLE IF NOT EXISTS commandes_client(id INTEGER PRIMARY KEY AUTOINCREMENT, ref_client INT(10),ref_commande VARCHAR(255),date_creation VARCHAR(255),date_livraison VARCHAR(255),mode_reglement VARCHAR(255), cond_reglement_code varchar(255),acompte VARCHAR(255),remise_commande VARCHAR(255),note_privee VARCHAR(255),total_ht VARCHAR(255),total_ttc VARCHAR(255),total_tva VARCHAR(50), statut INT(2),billed INT(2),isnew INT(2),issent INT(2))',
                []
            );
            console.log('commandes_client table created');
            //########################################
            txn.executeSql('DROP TABLE IF EXISTS commandes_produits', []);
            txn.executeSql(
                'CREATE TABLE IF NOT EXISTS commandes_produits(id INTEGER PRIMARY KEY AUTOINCREMENT, label VARCHAR(255), ref_produit VARCHAR(100), qt INT(10),price VARCHAR(100),price_ttc VARCHAR(100),tva VARCHAR(100),type_commande VARCHAR(2),remise_produit VARCHAR(20), id_commandes_client INT(10),pvu VARCHAR(20))',
                []
            );
            console.log('commandes_produits table created');
            //########################################
            let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : 1er telechargement commandes : table commandes_client+commandes_produits VIDER\n-------";
            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
        });
        this._downloading_data();
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    //###############################################################################
    async _download_commandes(srv,token) {
        var db = openDatabase({ name: 'iSalesDatabase.db' });

        console.log('#######################################"');
        console.log('Telechargement des commandes');
        let j = 0;
        let ind = 0;
        const { navigate } = this.props.navigation;

        while (j <= 250) {
            await axios.get(`${srv}/api/index.php/orders?sortfield=t.rowid&sortorder=DESC&limit=1&page=${j}&sqlfilters=fk_statut%3D1`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                .then(async (response) => {
                    if (response.status === 200) {
                        let mydata = response.data;
                        var lenght = ((mydata.length) - 1);
                        //console.log('lenght :' + lenght)
                        //await Object.keys(mydata, ind, moment, RNFS /*lenght,*/).forEach(async function (index, i) {

                            for (let index = 0; index < mydata.length; ++index) {

                            await db.transaction(async (tx) => {
                                console.log('----------------------- Commande ' + mydata[index].ref + ' ----------------------- ')
                                

                                await tx.executeSql(
                                    'INSERT INTO commandes_client (ref_client,ref_commande,date_creation,date_livraison,mode_reglement,cond_reglement_code,acompte,remise_commande,note_privee,total_ht,total_ttc,total_tva,statut,billed,issent) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                                    [mydata[index].socid, mydata[index].ref, mydata[index].date_commande, mydata[index].date_livraison, mydata[index].mode_reglement_code, mydata[index].cond_reglement_code, mydata[index].note_public, mydata[index].remise_percent, mydata[index].note_private, mydata[index].total_ht, mydata[index].total_ttc, mydata[index].total_tva, mydata[index].statut, mydata[index].billed, 1]
                                );
                                console.log('[INSERED] - Commande : ' + j + ' - (' + mydata[index].ref+')');
                                
                                //console.log('Page: ' + j + ' - Commande [' + index + '] - Ref : ' + mydata[index].ref + ' - [INSERED]');

                                await tx.executeSql(`SELECT id FROM commandes_client ORDER BY ID DESC`, [], async (tx, results) => {
                                    let table = mydata[index].lines;
                                    await Object.keys(table, results.rows.item(0).id, tx).forEach(async function (index) {
                                        await tx.executeSql(
                                            'INSERT INTO commandes_produits (label, ref_produit, qt,price,price_ttc,tva,remise_produit, id_commandes_client,pvu) VALUES (?,?,?,?,?,?,?,?,?)',
                                            [table[index].libelle, table[index].ref, table[index].qty, table[index].price, (parseFloat(table[index].price - ((table[index].price * table[index].remise_percent) / 100)) * table[index].qty).toFixed(2), table[index].tva_tx, table[index].remise_percent, results.rows.item(0).id, table[index].price]
                                        );
                                        console.log('Produit Line [' + index + '] - Produit Ref : ' + table[index].ref + ' - [insered]');
                                    });
                                });
                                console.log('index:' + index + ' - j:' + j);
                                if(j>=250){
                                    console.log('Le telechargement des commandes est finis');
                                    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : 1er telechargement des commandes : Telechargement FINI a 250\n-------";
                                    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
                                    //navigate('DownloadingImages_produits');
                                    navigate('Dashboard');
                                }
                            });

                            console.log('============================' + index + '============================');
                        }
                        //});
                        this.setState({index:j});
                        j = j + 1;
                    }
                })
                .catch(async (error) => {
                    //console.log('end')
                        ind += 1;
                        j=251;
                        if(ind === 1){
                            console.log('Le telechargement des commandes est finis');
                                    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : 1er telechargement des commandes : Telechargement FINI\n-------";
                                    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
                                    //navigate('DownloadingImages_produits');
                                    navigate('Dashboard');
                        }

                });
        }


    }

    //###############################################################################
     _downloading_data() {
         AsyncStorage.getItem('serv_name')
         .then(server => {
             const srv = server;
             AsyncStorage.getItem('user_token')
                 .then(token => {
                     this._download_commandes(srv, token);
                 });
         });

    }
    //###############################################################################

    render() {
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.container}>

                <Image style={styles.img} source={IMG1} />

                <Text style={styles.loading_text}>Téléchargement des données en cours .. 4/4</Text>
                <Text style={styles.loading_text}>{this.state.index} Commandes téléchargées</Text>
                <Text></Text>
                <Spinner />

            </View>
        )
    }
}

const styles = StyleSheet.create({
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
});