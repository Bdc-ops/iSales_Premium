import React from 'react';
import { StyleSheet, View, Text, Image, Alert, ScrollView, Dimensions,BackHandler } from 'react-native';
import CardView from 'react-native-cardview'
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import { Spinner } from '../../Spinner';
import { openDatabase } from 'react-native-sqlite-storage';

import NetInfo from "@react-native-community/netinfo";
import Sync_categories_prodtuis_navbar from '../../navbars/produits/sync_categories_prodtuis_navbar'
import moment from 'moment';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/FontAwesome5';

const IMG1 = require('../../res/sync_all.png');
const disconnected = require('../../res/notfound.png');
var { width } = Dimensions.get('window');
var db = openDatabase({ name: 'iSalesDatabase.db' });


export default class Syncfactures extends React.Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            state_connection: '',
            RefData: [],
            index:0,
            message:''
        };
        db.transaction(function (txn) {
            //########################################
            txn.executeSql('DROP TABLE IF EXISTS factures', []);
            txn.executeSql(
                'CREATE TABLE factures(id INTEGER PRIMARY KEY AUTOINCREMENT, socid VARCHAR(100),date VARCHAR(100),datem VARCHAR(100),date_creation VARCHAR(100),type VARCHAR(100),remise_percent VARCHAR(100),total_ht VARCHAR(100),total_tva VARCHAR(100),total_ttc VARCHAR(100),date_lim_reglement VARCHAR(100),cond_reglement_code VARCHAR(100),mode_reglement VARCHAR(100),ref VARCHAR(100),statut VARCHAR(100),brouillon VARCHAR(100),id_facture INT(10),etat VARCHAR(100))',
                []
            );
            console.log('factures table created');
            //########################################
            txn.executeSql('DROP TABLE IF EXISTS lines_facture', []);
            txn.executeSql(
                'CREATE TABLE lines_facture(id INTEGER PRIMARY KEY AUTOINCREMENT,id_facture INT(10), libelle VARCHAR(100),ref VARCHAR(100),qty VARCHAR(100),subprice VARCHAR(100),pa_ht VARCHAR(100),total_ht VARCHAR(100),total_tva VARCHAR(100),total_ttc VARCHAR(100),tva_tx VARCHAR(100),is_jalon VARCHAR(2))',
                []
            );
            console.log('lines_facture table created');
            //########################################
        });
    }


    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        this._isMounted = true;
        NetInfo.fetch().then(state => {
            this.setState({ state_connection: state.isConnected })
        });
        this._downloading_data();
    }

    /*componentWillMount() {
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
    }

    handleBackButton() {
        Alert.alert(
          "IMPORTANT",
          "Le telechargement des factures est en cours, veuillez patienter.. ",
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
    //###############################################################################
    async _download_facture(srv, token) {
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        var limit_fac = await AsyncStorage.getItem('limit_fac');
        console.log('limite :'+limit_fac);
        console.log('#######################################"');
        console.log('Telechargement des facture impayee');
        let j = 0;
        let ind = 0;
        while (j <= (limit_fac-1)) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>     ' + j + '     <<<<<<<<<<<<<<<<<<<<<<<<<<<<');

            await axios.get(`${srv}/api/index.php/invoices?sortfield=t.rowid&sortorder=DESC&sqlfilters=fk_statut%3D1%20or%20fk_statut%3D2&limit=1&page=${j}`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                .then(async (response) => {
                    if (response.status === 200) {
                        let mydata = response.data;
                        var lenght = ((mydata.length) - 1);
                        const { navigate } = this.props.navigation;
                        //console.log('lenght :' + lenght)
                        //await Object.keys(mydata, ind, lenght).forEach(async function (index, i) {
                            for (let index = 0; index < mydata.length; ++index) {
                            await db.transaction(async (tx) => {
                                console.log('----------------------- Facture ' + mydata[index].ref + ' ----------------------- ')
                                await tx.executeSql(
                                    'INSERT INTO factures (socid,date,datem,date_creation,type,remise_percent,total_ht,total_tva,total_ttc,date_lim_reglement,cond_reglement_code,mode_reglement,ref,statut,brouillon,id_facture,etat) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                                    [mydata[index].socid, mydata[index].date, mydata[index].datem, mydata[index].date_creation, mydata[index].type, mydata[index].remise_percent, mydata[index].total_ht, mydata[index].total_tva, mydata[index].total_ttc, mydata[index].date_lim_reglement, mydata[index].cond_reglement_code, mydata[index].mode_reglement_code, mydata[index].ref, mydata[index].statut, mydata[index].brouillon, mydata[index].id_facture, mydata[index].statut],
                                );
                                //console.log('[INSERED] - page : ' + j + ' - line : ' + index);
                                console.log('Facture [' + index + '] - Ref : ' + mydata[index].ref + ' - [INSERED]');

                                //console.log('Page: ' + j + ' - Commande [' + index + '] - Ref : ' + mydata[index].ref + ' - [INSERED]');

                                await tx.executeSql(`SELECT id FROM factures ORDER BY ID DESC`, [], async (tx, results) => {
                                    let table = mydata[index].lines;
                                    await Object.keys(table, results.rows.item(0).id, tx).forEach(async function (index) {
                                        let libelle ='';
                                        let is_jalon ='0';
                                        if(table[index].libelle && table[index].ref && table[index].product_ref){
                                            libelle = table[index].libelle;
                                            is_jalon ='0';
                                        }else if(table[index].label){
                                            libelle = table[index].label;
                                            is_jalon ='1';
                                        }else{
                                            libelle = table[index].desc;
                                            is_jalon ='0';
                                        }
                                        await tx.executeSql(
                                            'INSERT INTO lines_facture (id_facture,libelle,ref,qty,subprice,pa_ht,total_ht,total_tva,total_ttc,tva_tx,is_jalon) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
                                            [results.rows.item(0).id, libelle, table[index].ref, table[index].qty, table[index].subprice, table[index].pa_ht, table[index].total_ht, table[index].total_tva, table[index].total_ttc, table[index].tva_tx,is_jalon]
                                        );
                                        console.log('Line facture [' + index + '] - Ref : ' + table[index].ref + ' - [insered]');
                                    });
                                });
                                if(j>=(limit_fac-1)){
                                    console.log('Le telechargement des factures est finis');
                                    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : 1er telechargement des factures : Telechargement FINI a "+limit_fac+"\n-------";
                                    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
                                    //navigate('DownloadingImages_produits');
                                    this.setState({message:'Téléchargement terminé avec succès'});
                                    setTimeout(() => {
                                        navigate('Dashboard');
                                    }, 2500);
                                }

                            });
                        }
                        //});
                        this.setState({index:j});
                        j = j + 1;
                    }
                })
                .catch(async (error) => {
                    //j = 501;
                    if (error.response.status === 404) {
                        ind += 1;
                        if (ind === 1) {
                            j = limit_fac;
                            console.log('Le telechargement des factures est finis');
                            this.setState({message:'Téléchargement terminé avec succès'});
                            setTimeout(() => {
                                this.props.navigation.navigate('Dashboard');
                            }, 2500);
                        }
                    }
                });
        }
    }

    //###############################################################################

    _downloading_data() {
        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                AsyncStorage.getItem('serv_name')
                    .then(server => {
                        const srv = server;
                        AsyncStorage.getItem('user_token')
                            .then(token => {
                                this._download_facture(srv, token);
                            });
                    });
            } else {
                Alert.alert(
                    "IMPORTANT",
                    "Cette opération nécessite une connexion internet",
                    [

                        {
                            text: "Revenir", onPress: () => this.props.navigation.navigate('Factures')
                        }
                    ],
                    { cancelable: false }
                );
            }
        });

    }
    //###############################################################################

    render() {
        const { navigate } = this.props.navigation;

        return (

            <ScrollView contentContainerStyle={styles.containerMain} >
                <Sync_categories_prodtuis_navbar title={navigate}></Sync_categories_prodtuis_navbar>
                {
                    this.state.state_connection ?
                        (
                            <View style={styles.container}>
                                <Image style={styles.img} source={IMG1} />
                                {
                                    this.state.message.length > 0 ?
                                    (<Text style={styles.loading_text}><Icon name="check" size={15} style={{marginRight: 10,color: '#00BFA6',}} /> {this.state.message}</Text>)
                                    :
                                    (<View style={{alignItems: 'center',justifyContent: 'center',}}><Text style={styles.loading_text}>Téléchargement des factures en cours</Text>
                                    <Text style={styles.loading_text}>{this.state.index} Factures téléchargées</Text><Text></Text><Spinner/></View>)
                                }
                                

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

