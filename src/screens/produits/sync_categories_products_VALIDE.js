import React from 'react';
import { StyleSheet, View, Text, Image, Alert, ScrollView, Dimensions, BackHandler } from 'react-native';
import CardView from 'react-native-cardview'
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import { Spinner } from '../../Spinner';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import NetInfo from "@react-native-community/netinfo";
import Sync_categories_prodtuis_navbar from '../../navbars/produits/sync_categories_prodtuis_navbar'
import moment from 'moment';
import RNFS from 'react-native-fs';

const IMG1 = require('../../res/sync_all.png');
const disconnected = require('../../res/notfound.png');
var { width } = Dimensions.get('window');


export default class SyncCategoriesProduits extends React.Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            state_connection: '',
            RefData: [],
        };
        NetInfo.fetch().then(state => {
            this.setState({ state_connection: state.isConnected })
        });
    }


    componentDidMount() {
        let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Sync categories et produits\n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
        this._isMounted = true;
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }
    componentWillMount() {
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
        this._isMounted = false;
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    closeDB(db) {
        db.close(function () {
            console.log('database is closed ok');
        });
        let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Sync categories et produits : Couper la connexion avec la base de donnee\n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
    }
    handleBackButton() {
        Alert.alert(
            "IMPORTANT",
            "Le telechargement des produits est lancer, veuillez attendre quelques minutes..",
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
    async _download_categories(srv, token) {
        let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Sync categories et produits : telechargement des categories\n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        db.transaction(function (txn) {
            txn.executeSql('DROP TABLE IF EXISTS categories', []);
            txn.executeSql(
                'CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY AUTOINCREMENT, label VARCHAR(255), id_categorie INT(10), ref VARCHAR(100), type VARCHAR(100))',
                []
            );
            console.log('table created');
            let log_msg4 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Sync categories et produits : Suppression de l\'ancienne table\n-------";
            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg4, 'utf8');
        });

        console.log('#######################################"');
        console.log('Telechargement des categories');
        let j = 0;
        let ind = 0;
        const { navigate } = this.props.navigation;
        let _download_produits = this._download_produits.bind(this);
        while (j <= 600) {
            await axios.get(`${srv}/api/index.php/categories?sortfield=t.rowid&sortorder=ASC&limit=50&page=${j}&sqlfilters=type%3D0`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                .then(async (response) => {
                    if (response.status === 200) {
                        var mydata = response.data;
                        var lenght = ((mydata.length) - 1);

                        Object.keys(mydata, lenght, _download_produits, srv, token, navigate, moment, RNFS).forEach(async function (index, i) {
                            db.transaction(async function (tx) {
                                tx.executeSql(
                                    'INSERT INTO categories (label,id_categorie,ref,type) VALUES (?,?,?,?)',
                                    [mydata[index].label, mydata[index].id, mydata[index].ref, mydata[index].type],
                                    async (tx, results) => {
                                        if (results.rowsAffected > 0) {
                                            console.log('Success liste :' + index);
                                            let log_msg7 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Sync categories et produits : telechargement categorie : " + mydata[index].label + " REUSSI\n-------";
                                            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg7, 'utf8');
                                            /*if (ind === lenght) {
                                                console.log('end ############');
                                                await _download_produits(srv, token, navigate);
                                            }*/
                                        } else {
                                            console.log('Registration Failed');
                                        }
                                    }
                                );
                            });


                        });
                        j = j + 1;

                    }
                })
                .catch(async (error) => {
                    ind += 1;
                    if (ind === 1) {
                        console.log('end');
                        j = 601;
                        let log_msg4 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Sync categories et produits : END telechargement des categories\n-------";
                        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg4, 'utf8');
                        await _download_produits(srv, token, navigate);

                    }
                });

        }

    }
    //###############################################################################

    async _download_produits(srv, token, navigate) {
        let log_msg5 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Sync categories et produits : telechargement des produits\n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg5, 'utf8');
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        await db.transaction(async function (txn) {
            await txn.executeSql('DROP TABLE IF EXISTS produits', []);
            await txn.executeSql(
                'CREATE TABLE IF NOT EXISTS produits(id INTEGER PRIMARY KEY AUTOINCREMENT, label VARCHAR(100), description VARCHAR(100), type VARCHAR(100), price VARCHAR(100), price_ttc VARCHAR(100), price_min VARCHAR(100), price_min_ttc VARCHAR(100), tva_tx VARCHAR(100), stock_reel VARCHAR(100), status VARCHAR(100), status_buy VARCHAR(100), weight VARCHAR(100), weight_units VARCHAR(100), lengthP VARCHAR(100), length_units VARCHAR(100), surface VARCHAR(100), surface_units VARCHAR(100), volume VARCHAR(100), volume_units VARCHAR(100), barcode VARCHAR(100), date_creation VARCHAR(100), date_modification VARCHAR(100), ref_fourn VARCHAR(100), ref_supplier VARCHAR(100), id_produit VARCHAR(100), ref VARCHAR(100), note_private VARCHAR(255), note_public VARCHAR(255), note VARCHAR(255), country_code VARCHAR(100),id_categorie VARCHAR(100),colis_qty VARCHAR(100),options_colis_barcode VARCHAR(100),palette_qty VARCHAR(100),options_palette_barcode VARCHAR(100))',
                []
            );
            console.log('table created');
        });
        console.log('#######################################');
        console.log('Telechargement des produits');



        await db.transaction(async function (txn) {
            await txn.executeSql(`SELECT id_categorie FROM categories where type=0`, [], async (txn, results) => {
                let ind = 0;

                for (let i = 0; i < results.rows.length; i++) {
                    let cat_id = results.rows.item(i).id_categorie;
                    let j = 0;
                    console.log('Categorie : ' + cat_id);
                    while (j <= 600) {


                        await axios.get(`${srv}/api/index.php/products?sortfield=t.ref&sortorder=ASC&limit=50&page=${j}&category=${cat_id}&sqlfilters=tosell%3D1`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                            .then(async (response) => {
                                if (response.status === 200) {

                                    var mydata = response.data;
                                    Object.keys(mydata, ind, cat_id).forEach(async function (index, i) {
                                        db.transaction(async function (tx) {
                                            await tx.executeSql(
                                                'INSERT INTO produits (label, description, type, price, price_ttc, price_min, price_min_ttc, tva_tx, stock_reel, status, status_buy, weight, weight_units, lengthP, length_units, surface, surface_units, volume, volume_units, barcode, date_creation, date_modification, ref_fourn, ref_supplier, id_produit, ref, note_private, note_public, note, country_code,id_categorie,colis_qty,options_colis_barcode,palette_qty,options_palette_barcode) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                                                [mydata[index].label, mydata[index].description, mydata[index].type, mydata[index].price, mydata[index].price_ttc, mydata[index].price_min, mydata[index].price_min_ttc, mydata[index].tva_tx, mydata[index].stock_reel, mydata[index].status, mydata[index].status_buy, mydata[index].weight, mydata[index].weight_units, mydata[index].length, mydata[index].length_units, mydata[index].surface, mydata[index].surface_units, mydata[index].volume, mydata[index].volume_units, mydata[index].barcode, mydata[index].date_creation, mydata[index].date_modification, mydata[index].ref_fourn, mydata[index].ref_supplier, mydata[index].id, mydata[index].ref, mydata[index].note_private, mydata[index].note_public, mydata[index].note, mydata[index].country_code, cat_id, mydata[index].colis_qty ? mydata[index].colis_qty : '0', mydata[index].options_colis_barcode ? mydata[index].options_colis_barcode : '0', mydata[index].palette_qty ? mydata[index].palette_qty : '0', mydata[index].options_palette_barcode ? mydata[index].options_palette_barcode : '0']
                                            );
                                        });

                                        console.log('[Product INSERED] - page : ' + j + ' - line : ' + index + ' - categorie : ' + cat_id);
                                    });
                                    j = j + 1;
                                }
                            })
                            .catch(async (error) => {
                                ind = ind + 1;
                                j = 601;
                                if (ind === results.rows.length) {
                                    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : 1er telechargement des produits : Telechargement FINI\n-------";
                                    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
                                    console.log('Fin Produit =============');
                                    navigate('Dashboard');

                                }
                            });
                    }
                }
            });
        });


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
                                try {
                                    this._download_categories(srv, token);
                                } catch (error) {
                                    this.closeDB(db);
                                }
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
                                <Text style={styles.loading_text}>Synchronisation des categories et produits en cours</Text>
                                <Spinner />
                                {this._downloading_data(this)}

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

