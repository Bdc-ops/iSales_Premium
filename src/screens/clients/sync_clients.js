import React from 'react';
import { StyleSheet, View, Text, Image, Alert, ScrollView, Dimensions, BackHandler,TouchableOpacity } from 'react-native';
import CardView from 'react-native-cardview'
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import RNFS from 'react-native-fs';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Spinner } from '../../Spinner';
import RNBackgroundDownloader from 'react-native-background-downloader';
import { bindActionCreators } from 'redux';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import NetInfo from "@react-native-community/netinfo";
import Sync_clients_navbar from '../../navbars/clients/sync_clients_navbar'
import moment from 'moment';
const IMG1 = require('../../res/sync_all.png');
const disconnected = require('../../res/notfound.png');
var { width } = Dimensions.get('window');
import Icon from 'react-native-vector-icons/FontAwesome5';


export default class sync_clients extends React.Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            state_connection: '',
            index:0,
            message:''
        };
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
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        var db = openDatabase({ name: 'iSalesDatabase.db' });
    }*/

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
        this._isMounted = false;
        //this.closeDB(db);
    }

    handleBackButton() {
        Alert.alert(
            "IMPORTANT",
            "Le telechargement des clients est lancé, veuillez patienter..",
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

    closeDB(db) {
        db.close(function () {
            console.log('database is closed ok');
        });
        let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Synchronisation clients : Couper la connexion avec la base de donnee\n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
    }
    //###############################################################################
    async _download_clients(srv, token) {
        let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Synchronisation clients \n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        db.transaction(function (txn) {
            txn.executeSql('DROP TABLE IF EXISTS clients', []);
            txn.executeSql(
                'CREATE TABLE IF NOT EXISTS clients(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100), country VARCHAR(100),code_pays VARCHAR(100), town VARCHAR(100), zip VARCHAR(100), address VARCHAR(100), phone VARCHAR(100), fax VARCHAR(100), email VARCHAR(100), skype VARCHAR(100), url VARCHAR(100), idprof1 VARCHAR(100), idprof2 VARCHAR(100), idprof3 VARCHAR(100), idprof4 VARCHAR(100), note VARCHAR(255), code_client VARCHAR(100), code_fournisseur VARCHAR(100),ref VARCHAR(100))',
                []
            );
            console.log('table created');
        });
        console.log('#######################################"');
        console.log('Telechargement des clients');
        let j = 0;
        let ind = 0;
        while (j <= 10000) {
            await axios.get(`${srv}/api/index.php/thirdparties?sortfield=t.rowid&sortorder=ASC&limit=1&page=${j}`, { 'headers': { 'DOLAPIKEY': token, 'Accept': 'application/json' } })
                .then(async (response) => {
                    if (response.status === 200) {
                        var mydata = response.data;
                        Object.keys(mydata, ind, moment, RNFS).forEach(async function (index, i) {
                            if (ind === 0) {
                                db.transaction(async function (tx) {
                                    await tx.executeSql(
                                        'INSERT INTO clients (name,country,code_pays,town,zip,address,phone,fax,email,skype,url,idprof1,idprof2,idprof3,idprof4,note,code_client,code_fournisseur,ref) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                                        [mydata[index].name, mydata[index].country, mydata[index].country_id, mydata[index].town, mydata[index].zip, mydata[index].address, mydata[index].phone, mydata[index].fax, mydata[index].email, mydata[index].skype, mydata[index].url, mydata[index].idprof1, mydata[index].idprof2, mydata[index].idprof3, mydata[index].idprof4, mydata[index].note, mydata[index].code_client, mydata[index].code_fournisseur, mydata[index].ref]
                                    );
                                });
                            }
                            console.log('[INSERED] - Client : ' + j + ' - ('+mydata[index].name+')');

                            let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Synchronisation clients : client INSERED : " + mydata[index].name + "\n-------";
                            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
                        });
                        this.setState({index:j});
                        j = j + 1;
                    }
                })
                .catch(async (error) => {
                    ind += 1;
                    if (ind === 1) {
                        console.log('end ############');
                        let log_msg4 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Synchronisation clients : fin de telechargement des clients\n-------";
                        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg4, 'utf8');
                        j = 10001;
                        //this.props.navigation.navigate('Clients')
                        this.setState({message:'Téléchargement terminé avec succès'});
                        setTimeout(() => {
                            this.props.navigation.navigate('Dashboard')
                          }, 2500);
                    }
                })
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
                                this._download_clients(srv, token);
                            });
                    });
            } else {
                Alert.alert(
                    "IMPORTANT",
                    "Cette opération nécessite une connexion internet",
                    [

                        {
                            text: "Revenir", onPress: () => this.props.navigation.navigate('Clients')
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
                <Sync_clients_navbar title={navigate}></Sync_clients_navbar>
                {
                    this.state.state_connection ?
                        (
                            <View style={styles.container}>
                                <Image style={styles.img} source={IMG1} />
                                

                                {
                                    this.state.message.length > 0 ?
                                    (<Text style={styles.loading_text}><Icon name="check" size={15} style={{marginRight: 10,color: '#00BFA6',}} /> {this.state.message}</Text>)
                                    :
                                    (<View style={{alignItems: 'center',justifyContent: 'center',}}><Text style={styles.loading_text}>Téléchargement des clients en cours</Text>
                                    <Text style={styles.loading_text}>{this.state.index} Clients téléchargés</Text><Text></Text><Spinner/></View>)
                                }
                                
                                
                            </View>

                        ) :
                        (


                            <View style={styles.container}>
                                <CardView cardElevation={10} cornerRadius={5} style={styles.disconnected_view}>

                                    <Image style={styles.disconnected_img} source={disconnected} />
                                    <Text style={styles.importantmessage}>Cette opération nécessite une connexion internet</Text>
                                    <Text style={styles.importantmessage}>Veuillez verifier votre connexion</Text>
                                    <Text ></Text>
                                    <TouchableOpacity activeOpacity={.5} onPress={() => { navigate('Clients') }}><Text>Revenir en arrière</Text></TouchableOpacity>

                                    <Text></Text>
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

