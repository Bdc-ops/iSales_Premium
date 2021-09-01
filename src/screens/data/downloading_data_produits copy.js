import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Spinner } from '../../Spinner';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import RNFS from 'react-native-fs';
import moment from 'moment';
const IMG1 = require('../../res/sync_all.png');

export default class DownloadingData_produits extends React.Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            index:0
        };
    }
    componentDidMount() {
        this._isMounted = true;
        db.transaction(async function (txn) {
            await txn.executeSql('DROP TABLE IF EXISTS produits', []);
            await txn.executeSql(
                'CREATE TABLE IF NOT EXISTS produits(id INTEGER PRIMARY KEY AUTOINCREMENT, label VARCHAR(100), description VARCHAR(100), type VARCHAR(100), price VARCHAR(100), price_ttc VARCHAR(100), price_min VARCHAR(100), price_min_ttc VARCHAR(100), tva_tx VARCHAR(100), stock_reel VARCHAR(100), status VARCHAR(100), status_buy VARCHAR(100), weight VARCHAR(100), weight_units VARCHAR(100), lengthP VARCHAR(100), length_units VARCHAR(100), surface VARCHAR(100), surface_units VARCHAR(100), volume VARCHAR(100), volume_units VARCHAR(100), barcode VARCHAR(100), date_creation VARCHAR(100), date_modification VARCHAR(100), ref_fourn VARCHAR(100), ref_supplier VARCHAR(100), id_produit VARCHAR(100), ref VARCHAR(100), note_private VARCHAR(255), note_public VARCHAR(255), note VARCHAR(255), country_code VARCHAR(100),id_categorie VARCHAR(100),colis_qty VARCHAR(100),options_colis_barcode VARCHAR(100),palette_qty VARCHAR(100),options_palette_barcode VARCHAR(100), prix_vente_unitaire_extra VARCHAR(100))',
                []
            );
            console.log('table created');
            let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : 1er telechargement client : table produits VIDER\n-------";
            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
        });
        this._downloading_data();
    }
    componentWillUnmount() {
        this._isMounted = false;
    }


    //###############################################################################
    async _download_produits(srv, token) {
        const { navigate } = this.props.navigation;
        console.log('#######################################');
        console.log('Telechargement des produits');

        db.transaction(async function (txn) {
            await txn.executeSql(`SELECT id_categorie FROM categories where type=0`, [], async (txn, results) => {
                let ind = 0;
                let cn = 0;
                for (let i = 0; i < results.rows.length; i++) {

                    let cat_id = results.rows.item(i).id_categorie;
                    let j = 0;
                    //console.log('Categorie : ' + cat_id);
                    //while (j <= 600) {

                    while (j <= 10000) {
                        //await axios.get(`${srv}/api/index.php/products?sortfield=t.ref&sortorder=ASC&limit=50&page=${j}&category=${cat_id}&sqlfilters=tosell%3D1`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                        await axios.get(`${srv}/api/index.php/products?sortfield=t.ref&sortorder=ASC&limit=1&page=${j}&category=${cat_id}&sqlfilters=(ref%20like%20'%25C')%20and%20(tosell%3D1)`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                            .then(async (response) => {
                                if (response.status === 200) {

                                    var mydata = response.data;
                                    Object.keys(mydata, ind, cat_id).forEach(async function (index, i) {
                                        db.transaction(async function (tx) {
                                            await tx.executeSql(
                                                'INSERT INTO produits (label, description, type, price, price_ttc, price_min, price_min_ttc, tva_tx, stock_reel, status, status_buy, weight, weight_units, lengthP, length_units, surface, surface_units, volume, volume_units, barcode, date_creation, date_modification, ref_fourn, ref_supplier, id_produit, ref, note_private, note_public, note, country_code,id_categorie,colis_qty,options_colis_barcode,palette_qty,options_palette_barcode,prix_vente_unitaire_extra) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                                                [mydata[index].label, mydata[index].description, mydata[index].type, mydata[index].price, mydata[index].price_ttc, mydata[index].price_min, mydata[index].price_min_ttc, mydata[index].tva_tx, mydata[index].stock_reel, mydata[index].status, mydata[index].status_buy, mydata[index].weight, mydata[index].weight_units, mydata[index].length, mydata[index].length_units, mydata[index].surface, mydata[index].surface_units, mydata[index].volume, mydata[index].volume_units, mydata[index].barcode, mydata[index].date_creation, mydata[index].date_modification, mydata[index].ref_fourn, mydata[index].ref_supplier, mydata[index].id, mydata[index].ref, mydata[index].note_private, mydata[index].note_public, mydata[index].note, mydata[index].country_code, cat_id, mydata[index].array_options.options_colis_qty ? mydata[index].array_options.options_colis_qty : '0', mydata[index].array_options.options_colis_barcode ? mydata[index].array_options.options_colis_barcode : '0', mydata[index].array_options.options_palette_qty ? mydata[index].array_options.options_palette_qty : '0', mydata[index].array_options.options_palette_barcode ? mydata[index].array_options.options_palette_barcode : '0', mydata[index].uvc ? mydata[index].uvc : '0']
                                            );
                                        });
                                        //console.log('[Product INSERED] - Produit : ' + j + ' - ('+ mydata[index].label + ') - Categorie : ' + cat_id);
                                    });
                                    cn +=1 ;
                                    //console.log('Produit : '+j);

                                    j = j + 1;
                                }
                            })
                            .catch(async (error) => {
                                ind = ind + 1;
                                j = 10001;
                                if (ind === results.rows.length) {
                                    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : 1er telechargement des produits : Telechargement FINI\n-------";
                                    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
                                    console.log('Fin Produit =============');

                                    //navigate('DownloadingData_commandes');

                                }
                            });
                    }
                }
            });
        });
    }
    //###############################################################################
    _downloading_data() {

        check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE)
            .then(result => {
                if (RESULTS.GRANTED) {
                    AsyncStorage.getItem('serv_name')
                        .then(server => {
                            const srv = server;
                            AsyncStorage.getItem('user_token')
                                .then(token => {
                                    this._download_produits(srv, token);
                                });
                        });
                }
            })
            .catch(error => console.log(error));
    }
    //###############################################################################
    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.img} source={IMG1} />

                <Text style={styles.loading_text}>Téléchargement des données en cours .. 3/4</Text>
                <Text style={styles.loading_text}>{this.state.index} Produits téléchargés</Text>
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