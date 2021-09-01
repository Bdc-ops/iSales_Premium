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

export default class DownloadingData_categories extends React.Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            index:0,
        };
    }
    componentDidMount() {
        this._isMounted = true;
        db.transaction(function (txn) {
            //########################################

            txn.executeSql('DROP TABLE IF EXISTS categories', []);
            txn.executeSql(
                'CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY AUTOINCREMENT, label VARCHAR(255), id_categorie INT(10), ref VARCHAR(100), type VARCHAR(100),fk_parent INT(10))',
                []
            );
            console.log('Categories table created');
            //########################################
            txn.executeSql('DROP TABLE IF EXISTS panier', []);
            txn.executeSql(
                'CREATE TABLE IF NOT EXISTS panier(id INTEGER PRIMARY KEY AUTOINCREMENT, label VARCHAR(255), ref VARCHAR(100), qt INT(10),price VARCHAR(100),price_ttc VARCHAR(100),id_client INT(10), tva VARCHAR(100),type_commande VARCHAR(2),remise VARCHAR(20),pvu VARCHAR(20))',
                []
            );
            console.log('Panier table created');
            //########################################
            let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : 1er telechargement categories des produits : table categories+panier VIDER\n-------";
            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
        });
        this._downloading_data();
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    //###############################################################################
    async _download_categories(srv, token) {


        console.log('#######################################\nTelechargement des categories\n#######################################\n\n\n');

        let j = 0;
        let ind = 0;
        //while (j <= 600) {
        while (j <= 10000) {
            //await axios.get(`${srv}/api/index.php/categories?sortfield=t.rowid&sortorder=ASC&limit=50&page=${j}&sqlfilters=type%3D0`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
            await axios.get(`${srv}/api/index.php/categories?sortfield=t.rowid&sortorder=ASC&limit=1&page=${j}&sqlfilters=type%3D0`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
            .then(async (response) => {
                    if (response.status === 200) {
                        var mydata = response.data;
                        Object.keys(mydata).forEach(async function (index, i) {
                            db.transaction(async function (tx) {
                                await tx.executeSql(
                                    'INSERT INTO categories (label,id_categorie,ref,type,fk_parent) VALUES (?,?,?,?,?)',
                                    [mydata[index].label, mydata[index].id, mydata[index].ref, mydata[index].type, mydata[index].fk_parent]
                                );
                            });

                            console.log('[INSERED] - categorie : ' + j + ' - ('+mydata[index].label+')');
                        });
                        this.setState({index:j});
                        j = j + 1;
                    }
                })
                .catch(async (error) => {
                    ind += 1;
                    if (ind === 1) {
                        console.log('end');
                        j = 10001;
                        let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : 1er telechargement categories des produits : Telechargement FINI\n-------";
                        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
                        console.log('Le telechargement des categories est finis');
                        this.props.navigation.navigate('DownloadingData_produits')
                    }
                })
        }
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
                                    this._download_categories(srv, token);
                                });
                        });
                }
            })
            .catch(error => console.log(error));
    }
    //###############################################################################

    render() {
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.container}>
                <Image style={styles.img} source={IMG1} />

                <Text style={styles.loading_text}>Téléchargement des données en cours .. 2/4</Text>
                <Text style={styles.loading_text}>{this.state.index} Catégories téléchargées</Text>
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