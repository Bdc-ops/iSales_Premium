import React from 'react';
import { StyleSheet, View, Text, Image, Alert, ScrollView, Dimensions } from 'react-native';
import CardView from 'react-native-cardview'
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import { Spinner } from '../../Spinner';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import NetInfo from "@react-native-community/netinfo";
import Sync_categories_prodtuis_navbar from '../../navbars/produits/sync_categories_prodtuis_navbar'

const IMG1 = require('../../res/sync_all.png');
const disconnected = require('../../res/notfound.png');
var { width } = Dimensions.get('window');


export default class Syncfactures extends React.Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            state_connection: '',
            RefData: [],
            data_lenght: 0
        };
    }


    componentDidMount() {
        this._isMounted = true;
        NetInfo.fetch().then(state => {
            this.setState({ state_connection: state.isConnected })
        });
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    //###############################################################################
    async _download_facture_impayee(srv, token) {

        db.transaction(function (txn) {
            //########################################
            txn.executeSql('DROP TABLE IF EXISTS factures', []);
            txn.executeSql(
                'CREATE TABLE IF NOT EXISTS factures(id INTEGER PRIMARY KEY AUTOINCREMENT, socid VARCHAR(100),date VARCHAR(100),datem VARCHAR(100),date_creation VARCHAR(100),type VARCHAR(100),remise_percent VARCHAR(100),total_ht VARCHAR(100),total_tva VARCHAR(100),total_ttc VARCHAR(100),date_lim_reglement VARCHAR(100),cond_reglement_code VARCHAR(100),ref VARCHAR(100),statut VARCHAR(100),brouillon VARCHAR(100),id_facture INT(10),etat VARCHAR(100))',
                []
            );
            console.log('factures table created');
            //########################################
            txn.executeSql('DROP TABLE IF EXISTS lines_facture', []);
            txn.executeSql(
                'CREATE TABLE IF NOT EXISTS lines_facture(id INTEGER PRIMARY KEY AUTOINCREMENT,id_facture INT(10), libelle VARCHAR(100),ref VARCHAR(100),qty VARCHAR(100),subprice VARCHAR(100),pa_ht VARCHAR(100),total_ht VARCHAR(100),total_tva VARCHAR(100),total_ttc VARCHAR(100),tva_tx VARCHAR(100))',
                []
            );
            console.log('lines_facture table created');
            //########################################

        });



        console.log('#######################################');
        console.log('Telechargement des factures impayees');
        let j = 0;
        let ind = 0;
        const { navigate } = this.props.navigation;
        while (j <= 500) {
            await axios.get(`${srv}/api/index.php/invoices?sortfield=t.rowid&sortorder=ASC&status=unpaid&limit=50&page=${j}`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                .then(async (response) => {
                    this.setState({ data_lenght: 1 });
                    if (response.status === 200) {
                        let mydata = response.data;
                        var lenght = ((mydata.length) - 1);

                        //console.log('lenght :' + lenght)
                        let _download_facture_payee = this._download_facture_payee.bind(this);

                        await Object.keys(mydata, ind, _download_facture_payee/*lenght,*/).forEach(async function (index, i) {
                            await db.transaction(async function (tx) {
                                console.log('----------------------- Facture ' + mydata[index].ref + ' ----------------------- ')
                                await tx.executeSql(
                                    'INSERT INTO factures (socid,date,datem,date_creation,type,remise_percent,total_ht,total_tva,total_ttc,date_lim_reglement,cond_reglement_code,ref,statut,brouillon,id_facture,etat) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                                    [mydata[index].socid, mydata[index].date, mydata[index].datem, mydata[index].date_creation, mydata[index].type, mydata[index].remise_percent, mydata[index].total_ht, mydata[index].total_tva, mydata[index].total_ttc, mydata[index].date_lim_reglement, mydata[index].cond_reglement_code, mydata[index].ref, mydata[index].statut, mydata[index].brouillon, mydata[index].id_facture, "unpaid"],
                                );
                                console.log('[INSERED] - page : ' + j + ' - line : ' + index);
                                //console.log('Page: ' + j + ' - Commande [' + index + '] - Ref : ' + mydata[index].ref + ' - [INSERED]');

                                await tx.executeSql(`SELECT id FROM factures ORDER BY ID DESC`, [], async (tx, results) => {
                                    let table = mydata[index].lines;
                                    await Object.keys(table, results.rows.item(0).id, tx).forEach(async function (index) {
                                        await tx.executeSql(
                                            'INSERT INTO lines_facture (id_facture,libelle,ref,qty,subprice,pa_ht,total_ht,total_tva,total_ttc,tva_tx) VALUES (?,?,?,?,?,?,?,?,?,?)',
                                            [results.rows.item(0).id, table[index].libelle, table[index].ref, table[index].qty, table[index].subprice, table[index].pa_ht, table[index].total_ht, table[index].total_tva, table[index].total_ttc, table[index].tva_tx]
                                        );
                                        console.log('Line facture [' + index + '] - Ref : ' + table[index].ref + ' - [insered]');
                                    });
                                });
                                if (lenght == index) {
                                    j = 501;
                                    console.log('Le telechargement des factures impayee est finis');
                                    //navigate('DownloadingImages_produits');
                                    await _download_facture_payee(srv, token);
                                }

                                console.log('index:' + index + ' - j:' + j);


                            });

                            console.log('============================' + index + '============================');

                        });
                        j = j + 1;
                    }
                })
                .catch(async (error) => {
                    let _download_facture_payee = this._download_facture_payee.bind(this);

                    ind += 1;
                    if (ind === 1) {
                        if (error.response.status === 404) {
                            await _download_facture_payee(srv, token);
                        }
                    }

                });
        }

    }
    //###############################################################################

    async _download_facture_payee(srv, token) {

        console.log('#######################################');
        console.log('Telechargement des factures payee');
        let j = 0;
        let ind = 0;
        const { navigate } = this.props.navigation;
        while (j <= 500) {
            await axios.get(`${srv}/api/index.php/invoices?sortfield=t.rowid&sortorder=ASC&status=paid&limit=50&page=${j}`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                .then(async (response) => {
                    if (response.status === 200) {
                        this.setState({ data_lenght: 1 });
                        let mydata = response.data;
                        var lenght = ((mydata.length) - 1);
                        //console.log('lenght :' + lenght)
                        await Object.keys(mydata, ind, navigate, lenght).forEach(async function (index, i) {
                            await db.transaction(async function (tx) {
                                console.log('----------------------- Facture ' + mydata[index].ref + ' ----------------------- ')
                                await tx.executeSql(
                                    'INSERT INTO factures (socid,date,datem,date_creation,type,remise_percent,total_ht,total_tva,total_ttc,date_lim_reglement,cond_reglement_code,ref,statut,brouillon,id_facture,etat) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                                    [mydata[index].socid, mydata[index].date, mydata[index].datem, mydata[index].date_creation, mydata[index].type, mydata[index].remise_percent, mydata[index].total_ht, mydata[index].total_tva, mydata[index].total_ttc, mydata[index].date_lim_reglement, mydata[index].cond_reglement_code, mydata[index].ref, mydata[index].statut, mydata[index].brouillon, mydata[index].id_facture, "paid"],
                                );
                                console.log('[INSERED] - page : ' + j + ' - line : ' + index);
                                //console.log('Page: ' + j + ' - Commande [' + index + '] - Ref : ' + mydata[index].ref + ' - [INSERED]');

                                await tx.executeSql(`SELECT id FROM factures ORDER BY ID DESC`, [], async (tx, results) => {
                                    let table = mydata[index].lines;
                                    await Object.keys(table, results.rows.item(0).id, tx).forEach(async function (index) {
                                        await tx.executeSql(
                                            'INSERT INTO lines_facture (id_facture,libelle,ref,qty,subprice,pa_ht,total_ht,total_tva,total_ttc) VALUES (?,?,?,?,?,?,?,?,?)',
                                            [results.rows.item(0).id, table[index].libelle, table[index].ref, table[index].qty, table[index].subprice, table[index].pa_ht, table[index].total_ht, table[index].total_tva, table[index].total_ttc]
                                        );


                                        console.log('Line facture [' + index + '] - Ref : ' + table[index].ref + ' - [insered]');
                                    });
                                });
                                if (lenght == index) {

                                    j = 501;
                                    console.log('Le telechargement des factures payee est finis');
                                }

                                console.log('index:' + index + ' - j:' + j);


                            });

                            console.log('============================' + index + '============================');

                        });
                        j = j + 1;
                    }
                })
                .catch(async (error) => {
                    if (error.response.status === 404) {
                        ind += 1;
                        if (ind === 1) {
                            if (this.state.data_lenght === 0) {
                                Alert.alert(
                                    "IMPORTANT",
                                    "Aucune facture trouvée",
                                    [

                                        {
                                            text: "Revenir", onPress: () => this.props.navigation.navigate('Dashboard')
                                        }
                                    ],
                                    { cancelable: false }
                                );
                            } else {
                                navigate('Dashboard');
                            }
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
                                this._download_facture_impayee(srv, token);
                            });
                    });
            } else {
                Alert.alert(
                    "IMPORTANT",
                    "Cette opération nécessite une connexion internet",
                    [

                        {
                            text: "Revenir", onPress: () => this.props.navigation.navigate('Categories')
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
                                <Text style={styles.loading_text}>Téléchargement des factures en cours</Text>
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

