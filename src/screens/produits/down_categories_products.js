import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Dimensions, BackHandler, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import RNFS, { stat } from 'react-native-fs';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Spinner } from '../../Spinner';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import NetInfo from "@react-native-community/netinfo";
import Sync_categories_prodtuis_navbar from '../../navbars/produits/sync_categories_prodtuis_navbar'
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome5';

const IMG1 = require('../../res/sync_all.png');
const disconnected = require('../../res/notfound.png');
var { width } = Dimensions.get('window');
import CardView from 'react-native-cardview';

export default class DownCategoriesProduits extends React.Component {

    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            RefData: [],
            state_connection: '',
            nb_imgs: '',
            stat: '',
            index:0,
            message:''
        };

    }


    componentDidMount() {
        let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Sync images produits\n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        this._isMounted = true;
        NetInfo.fetch().then(state => {
            this.setState({ state_connection: state.isConnected })
        });
        db.transaction(tx => {
            tx.executeSql(`SELECT ref FROM produits`, [], (tx, results) => {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                    temp.push(results.rows.item(i));
                }
                this.setState({
                    RefData: temp,
                    nb_imgs: temp.length,
                    //stat: ((temp.length * 2) % 3600 / 60).toFixed(2),
                });
                this._downloading_data();
            });
        });
    }

    /*componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        var db = openDatabase({ name: 'iSalesDatabase.db' });
    }*/

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
        this._isMounted = false;
        this.closeDB(db);
    }

    closeDB(db) {
        db.close(function () {
            console.log('database is closed ok');
        });
        let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Sync images produits : Couper la connexion avec la base de donnee\n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
    }
    handleBackButton() {
        Alert.alert(
            "IMPORTANT",
            "Telechargement des images produits est en cours, ne pas toucher et patienter..",
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
    async _download_produits(srv, token) {
        let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Sync images produits : telechargement des images\n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
        console.log('#######################################');
        console.log('Telechargement des images produits');
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        const ImagesPath = RNFS.DocumentDirectoryPath + '/iSales_3/produits/images/';

        await RNFS.unlink(ImagesPath)
            .then(async () => {
                console.log('OLD Repertory deleted');
            })
            .catch((err) => {
                console.log(err.message);
            });

        await RNFS.mkdir(ImagesPath)
            .then(async (success) => {
                let lg = this.state.RefData.length;
                for (let i = 0; i < lg; i++) {
                    await RNFS.downloadFile({
                        background: true,
                        discretionary: true,
                        fromUrl: `${srv}/api/ryimg/product.php?DOLAPIKEY=${token}&ref=${this.state.RefData[i].ref}&modulepart=product`,
                        toFile: `${RNFS.DocumentDirectoryPath}/iSales_3/produits/images/${this.state.RefData[i].ref}.jpg`,
                    }).promise.then(async (response) => {
                        if ((lg - 1) === i) {
                            console.log('telechargement complet');
                            let log_msg4 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Sync images produits : END telechargement images produit \n-------";
                            RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg4, 'utf8');
                            this.setState({message:'Téléchargement terminé avec succès'});
                            setTimeout(() => {
                                this.props.navigation.navigate('Categories');
                            }, 2500);
                        }
                        let log_msg5 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Sync images produits : telechargement image du produit : " + this.state.RefData[i].ref + " REUSSI\n-------";
                        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg5, 'utf8');
                        console.log('Image :' + i + ' - ' + this.state.RefData[i].ref + '<= DOWNLOADED');
                        this.setState({index:i});

                    }).catch(async (error) => {
                        let log_msg6 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Sync images produits : ERROR : " + error + " REUSSI\n-------";
                        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg6, 'utf8');
                        console.log(error);
                    });
                }
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
                                    (<View style={{alignItems: 'center',justifyContent: 'center',}}><Text style={styles.loading_text}>Téléchargement des images produits en cours</Text>
                                    <Text style={styles.loading_text}>{this.state.index} Images téléchargées</Text><Text></Text><Spinner/></View>)
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