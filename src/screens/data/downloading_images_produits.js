import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import RNFS, { stat } from 'react-native-fs';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Spinner } from '../../Spinner';
import RNBackgroundDownloader from 'react-native-background-downloader';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import moment from 'moment';
const IMG1 = require('../../res/sync_all.png');

export default class DownloadingImages_produits extends React.Component {

    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            RefData: [],
        };

    }
    componentDidMount() {
        this._isMounted = true;
        db.transaction(tx => {
            tx.executeSql(`SELECT ref FROM produits`, [], (tx, results) => {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                    temp.push(results.rows.item(i));
                }
                this.setState({
                    RefData: temp,
                });
            });
        });
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    //###############################################################################
    async _download_produits(srv, token) {
        console.log('#######################################');
        console.log('Telechargement des images produits');
        console.log('part 0');

        const ImagesPath = RNFS.DocumentDirectoryPath + '/iSales_3/produits/images/';
        await RNFS.unlink(ImagesPath)
            .then(async () => {
                console.log('OLD Repertory deleted');
            })
            .catch((err) => {
                console.log(err.message);
            });

        console.log('part 1');

        await RNFS.mkdir(ImagesPath)
            .then(async (success) => {
                console.log('part 2');

                let lg = this.state.RefData.length;
                for (let i = 0; i < lg; i++) {
                    RNBackgroundDownloader.download({
                        id: String(i),
                        url: `${srv}/api/ryimg/product.php?DOLAPIKEY=${token}&ref=${this.state.RefData[i].ref}&modulepart=product`,
                        destination: `${RNFS.DocumentDirectoryPath}/iSales_3/produits/images/${this.state.RefData[i].ref}.jpg`,
                        headers: {
                            DOLAPIKEY: token,
                            Accept: 'application/json',
                        }
                    }).begin(async (expectedBytes) => {
                        console.log('part 3');

                        if (expectedBytes <= 100) {
                            console.log('part 4');

                            console.log('Image : ' + i + ' - ' + this.state.RefData[i].ref + ' <= EMPTY [WILL BE DELETED]');
                            await RNFS.unlink(RNFS.DocumentDirectoryPath + '/iSales_3/produits/images/' + this.state.RefData[i].ref + '.jpg');
                        }
                    }).done(async () => {
                        console.log('part 5');

                        console.log('Image :' + i + ' - ' + this.state.RefData[i].ref + '<= DOWNLOADED');
                        if ((lg - 1) === i) {
                            console.log('telechargement complet');
                            this.props.navigation.navigate('Dashboard');
                        }
                    }).error(async (error) => {
                        console.log('part 6');

                        console.log('error');
                        if ((lg - 1) === i) {
                            console.log('telechargement complet');
                            this.props.navigation.navigate('Dashboard');
                        }
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
        const state = this.state;
        return (
            <View style={styles.container}>
                <Image style={styles.img} source={IMG1} />

                <Text style={styles.loading_text}>Téléchargement des données en cours .. 5/5</Text>
                <Text></Text>
                <Spinner />
                {this._downloading_data()}


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