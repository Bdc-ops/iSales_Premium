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

export default class DownloadingData_clients extends React.Component {

    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            index:0,
        };
    }
    componentDidMount() {

        var db = openDatabase({ name: 'iSalesDatabase.db' });
        this._isMounted = true;
        db.transaction(function (txn) {
            //########################################
            txn.executeSql('DROP TABLE IF EXISTS clients', []);
            txn.executeSql(
                'CREATE TABLE IF NOT EXISTS clients(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100), country VARCHAR(100),code_pays VARCHAR(100), town VARCHAR(100), zip VARCHAR(100), address VARCHAR(100), phone VARCHAR(100), fax VARCHAR(100), email VARCHAR(100), skype VARCHAR(100), url VARCHAR(100), idprof1 VARCHAR(100), idprof2 VARCHAR(100), idprof3 VARCHAR(100), idprof4 VARCHAR(100), note VARCHAR(255), code_client VARCHAR(100), code_fournisseur VARCHAR(100),ref VARCHAR(100))',
                []
            );
            console.log('table clients created');
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
            let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : 1er telechargement client : table clients+factures+lines_factures VIDER\n-------";
            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
        });
        this._downloading_data();
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    //###############################################################################
    async _download_clients(srv, token) {
        var db = openDatabase({ name: 'iSalesDatabase.db' });

        console.log('#######################################\nTelechargement des clients\n#######################################\n\n\n');

        let j = 0;
        let ind = 0;
        //while (j <= 600) {
        while (j <= 10000) {                
            //console.log('URL', `${srv}/api/index.php/thirdparties?sortfield=t.rowid&sortorder=ASC&limit=50&page=${j}&DOLAPIKEY=${token}`);
            //await axios.get(`${srv}/api/index.php/thirdparties?sortfield=t.rowid&sortorder=ASC&limit=50&page=${j}`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
            await axios.get(`${srv}/api/index.php/thirdparties?sortfield=t.rowid&sortorder=ASC&limit=1&page=${j}`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                .then(async (response) => {
                    if (response.status === 200) {
                        var mydata = response.data;
                        Object.keys(mydata, ind).forEach(async function (index, i) {
                            if (ind === 0) {
                                db.transaction(async function (tx) {
                                    await tx.executeSql(
                                        'INSERT INTO clients (name,country,code_pays,town,zip,address,phone,fax,email,skype,url,idprof1,idprof2,idprof3,idprof4,note,code_client,code_fournisseur,ref) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                                        [mydata[index].name, mydata[index].country, mydata[index].country_id, mydata[index].town, mydata[index].zip, mydata[index].address, mydata[index].phone, mydata[index].fax, mydata[index].email, mydata[index].skype, mydata[index].url, mydata[index].idprof1, mydata[index].idprof2, mydata[index].idprof3, mydata[index].idprof4, mydata[index].note, mydata[index].code_client, mydata[index].code_fournisseur, mydata[index].ref]
                                    );
                                });
                            }
                            console.log('[INSERED] - Client : ' + j + ' - ('+mydata[index].name+')');
                        });
                        this.setState({index:j});
                        j = j + 1;
                        //console.log('ind1 : '+ind);
                    }else{
                        console.log('status axios != 200');
                    }
                })
                .catch(async (error) => {
                    ind += 1;
                    console.log('ind0'+ind);
                    if (ind === 1) {
                        console.log('ind'+ind);
                        j = 10001;
                        let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : 1er telechargement des clients : Telechargement FINI\n-------";
                        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
                        console.log('Le telechargement des clients est finis');
                        this.props.navigation.navigate('DownloadingData_categories');
                    }
                })
        }


    }

    //###############################################################################
    _downloading_data() {
        AsyncStorage.getItem('serv_name')
            .then(server => {
                const srv = server;
                AsyncStorage.getItem('user_token')
                    .then(token => {
                        this._download_clients(srv, token);
                    });
            });
    }
    //###############################################################################

    render() {
        const { navigate } = this.props.navigation;

        return (
            <View style={styles.container}>
                <Image style={styles.img} source={IMG1} />

                <Text style={styles.loading_text}>Téléchargement des données en cours .. 1/4</Text>
                <Text style={styles.loading_text}>{this.state.index} Clients téléchargés</Text>
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