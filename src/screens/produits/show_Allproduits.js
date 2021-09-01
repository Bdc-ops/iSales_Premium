import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Produits_navbar from '../../navbars/produits/produits_navbar';
import CardView from 'react-native-cardview';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import moment from 'moment';

const IMG1 = require('../../res/loading.png');

export default class ShowAllProduits extends React.Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this._onScroll = this._onScroll.bind(this);
        this.state = {
            AllProductData: [],
            pages_number: 5,
            img_found: 0,
            bg_timer: null,
            token: '',
            url: '',
            contentOffsetY: 0,
            msg_chargement: '',
        };
    }

    LoadData(page) {
        let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Toutes les produits : page " + (page / 5) + "\n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        db.transaction(tx => {
            tx.executeSql(`SELECT * FROM produits order by id_categorie limit ${page}`, [], (tx, results) => {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                    temp.push(results.rows.item(i));
                }

                this.setState({
                    AllProductData: temp,
                    pages_number: page,
                    bg_timer: 1,
                    msg_chargement: ''
                    //token: token,
                });
            });
        });
    }

    _nextbutton() {
        const newpage = this.state.pages_number + 5;
        console.log(newpage);
        this.LoadData(newpage);
    }

    componentDidMount() {
        let log_msg4 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " ===> Toutes les produits \n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg4, 'utf8');
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        AsyncStorage.getItem('serv_name')
            .then(server => {
                AsyncStorage.getItem('user_token')
                    .then(token => (
                        this.setState({
                            token: token,
                            url: server
                        })
                    ));
            })
        this._isMounted = true;
        this.LoadData(5);
    }
    /*componentWillMount() {
        var db = openDatabase({ name: 'iSalesDatabase.db' });
    }*/
    componentWillUnmount() {
        this._isMounted = false;
        this.closeDB(db);
    }

    closeDB(db) {
        db.close(function () {
            console.log('database is closed ok');
        });
        let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Toutes les produits : Couper la connexion avec la base de donnee \n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
    }
    _Showinfos(ref) {
        let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Toutes les produits : Ouverture du produit Ref :" + ref + "\n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
        this.props.navigation.navigate('ShowProduitInfos', { ref: ref, id_cat: null, rechercheinput: null });
    }

    _onScroll(e) {
        /*var contentOffset = e.nativeEvent.contentOffset.y;
        this.state.contentOffsetY < contentOffset ? this._nextbutton() : console.log("Scroll Up");
        this.setState({ contentOffsetY: contentOffset });*/
        let paddingToBottom = 10;
        paddingToBottom += e.nativeEvent.layoutMeasurement.height;
        if (e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height - paddingToBottom) {
            console.log("next");
            this.setState({ msg_chargement: 'Chargement en cours' })
            this._nextbutton();
        }
    }

    render() {
        const state = this.state;
        const { navigate } = this.props.navigation;

        return (
            <View style={styles.containerMain}>
                <ScrollView contentContainerStyle={styles.containerMain} ref='_scrollView' onScroll={this._onScroll}>


                    <Produits_navbar title={navigate}></Produits_navbar>
                    <View style={styles.container}>
                        <View style={styles.containerResults}>


                            {
                                state.bg_timer === null ?
                                    (<View style={styles.loading_view}>
                                        <Image style={styles.img} source={IMG1} />
                                        <Text style={styles.loading_text}>Chargement en cours ...</Text>
                                    </View>

                                    )
                                    :
                                    (<Text></Text>)
                            }

                            {
                                state.AllProductData.length > 0 ?
                                    state.AllProductData.map((rowData, index) => (
                                        <CardView key={index} cardElevation={10} cornerRadius={5} style={styles.cardViewStyle}>
                                            <TouchableOpacity style={styles.cardViewStyle}
                                                onPress={() => this._Showinfos(rowData.ref)}>


                                                <ImageBackground style={styles.circle} source={require('../../res/notfound_image.jpg')}>
                                                    <Image style={styles.circle} source={{ uri: 'file://' + RNFS.DocumentDirectoryPath + '/iSales_3/produits/images/' + rowData.ref + '.jpg' }} />
                                                </ImageBackground>

                                                <View style={styles.details}>
                                                    <View style={styles.productheader}>
                                                        <Text style={styles.productname}>
                                                            {rowData.label}
                                                        </Text>

                                                        <View style={styles.cref}>
                                                            {rowData.ref ? (<Text style={styles.ref}>{rowData.ref}</Text>) : ''}
                                                        </View>
                                                    </View>
                                                    <View style={styles.productinfos}>
                                                        <Icon name="tag" size={12} style={styles.iconDetails} />
                                                        <Text style={styles.TarifText}>{rowData.price ?(parseFloat(rowData.price)).toFixed(2)+' € HT' :(<Text style={styles.StockText_null}>Prix HT non fourni</Text>)}</Text>
                                                    </View>
                                                    <View style={styles.productinfos}>
                                                        <Icon name="tags" size={12} style={styles.iconDetails} />
                                                        <Text style={styles.TarifText}>{rowData.price_ttc ? (parseFloat(rowData.price_ttc)).toFixed(2)+' € TTC':(<Text style={styles.StockText_null}>Prix TTC non fourni</Text>)} </Text>
                                                    </View>
                                                    <View style={styles.productinfos_stock}>
                                                        <Icon name="boxes" size={13} style={styles.iconDetails} />
                                                        {
                                                                rowData.stock_reel && rowData.stock_reel>0 ?
                                                                (<Text style={styles.StockText}>{rowData.stock_reel} en stock</Text>)
                                                                :
                                                                (<Text style={styles.StockText_null}>Stock non fourni</Text>)
                                                        }
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        </CardView>
                                    ))
                                    :
                                    (<Text></Text>)
                            }


                            <Text>{this.state.msg_chargement}</Text>

                        </View>
                    </View>

                </ScrollView>

                {
                    state.bg_timer === 1 && state.AllProductData.length > 3 ?
                        (
                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', }}>
                                <View style={styles.PaginationNextButtonContainer}>
                                    <TouchableOpacity style={styles.PaginationUpButton} activeOpacity={.5}
                                        onPress={() => { this.refs._scrollView.scrollTo({ x: 0, y: 0, animated: true }); }}>
                                        <Icon name="arrow-up" size={20} style={styles.icons} />
                                    </TouchableOpacity>

                                </View>
                            </View>
                        )
                        :
                        (<Text></Text>)

                }
            </View>
        );
    }
}




const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#808B97' },
    text: { margin: 6 },
    row: { flexDirection: 'row', backgroundColor: '#FFF1C1' },
    btn: { width: 58, height: 18, backgroundColor: '#78B7BB', borderRadius: 2 },
    btnText: { textAlign: 'center', color: '#fff' },

    containerMain: {
        flexGrow: 1,
        justifyContent: 'center',
        backgroundColor: '#ffffff',

    },
    containerResults: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },

    container: {
        flex: 1
    },
    cardViewStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        width: '90%',
        height: 150,
        margin: 10,
    },
    PaginationLeftButton: {
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 15,
        backgroundColor: '#00BFA6',
        borderRadius: 50,
        width: 40,
        height: 40,
        position: 'absolute',
        left: 50,
        bottom: 0,
    },
    PaginationLeftButtonDisabled: {
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 15,
        backgroundColor: '#CED4DA',
        borderRadius: 50,
        width: 40,
        height: 40,
        position: 'absolute',
        left: 50,
        bottom: 0,
    },
    PaginationRightButton: {
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 15,
        backgroundColor: '#00BFA6',
        borderRadius: 50,
        width: 40,
        height: 40,
        position: 'absolute',
        right: 50,
        bottom: 0,
    },
    PaginationRightButtonDisabled: {
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 15,
        backgroundColor: '#CED4DA',
        borderRadius: 50,
        width: 40,
        height: 40,
        position: 'absolute',
        right: 50,
        bottom: 0,
    },
    PaginationButton: {
        marginTop: 50,
        marginBottom: 20,

    },
    icons: {
        color: '#ffffff',
        alignItems: 'flex-end'
    },
    circle: {
        margin: 20,
        width: 100,
        height: 100,
        borderRadius: 50,
        paddingTop: 10,
        paddingBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    TarifText: {
        fontSize: 18,
    },
    StockText: {
        fontSize: 15,
        color: '#00BFA6',
    },
    StockText_null: {
        fontSize: 15,
        color: '#d64541',
    },
    country: {
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: 20,
    },
    productinfos: {
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: 20,

    },
    productinfos_stock: {
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: 20,
        marginTop: 10,
    },
    iconDetails: {
        marginRight: 10,
        marginLeft: 5,
        color: '#00BFA6',
    },
    img: {
        width: 350,
        height: 240,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    loading_text: {
        alignItems: 'center',
        justifyContent: 'center',
        color: '#00BFA6',
    },
    loading_view: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    productname: {
        marginLeft: 20,
        color: '#00BFA6',
        fontSize: 16,
        width: '55%',
    },
    cref: {
        width: '30%',
    },
    ref: {
        position: 'absolute',
        right: 10,
        top: 0,
        backgroundColor: '#e9e9e9',
        borderRadius: 5,
        padding: 5,
        fontSize: 13,

    },
    productheader: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    PaginationNextButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        position: 'absolute',
        bottom: 5,
        right: 10,

        backgroundColor: 'rgba(250, 250, 250, 0.8)',
        borderColor: '#00BFA6',
        borderWidth: 1,
        borderRadius: 50,
        //width: 30
    },
    PaginationUpButton: {
        alignItems: 'center',
        paddingTop: 18,
        paddingBottom: 15,
        backgroundColor: '#00BFA6',
        borderRadius: 50,
        width: 60,
        height: 60,
        margin: 10,
        bottom: 0,
        zIndex: 100,
    },
    PaginationNextButton: {
        alignItems: 'center',
        paddingTop: 18,
        paddingBottom: 15,
        backgroundColor: '#00BFA6',
        borderRadius: 50,
        width: 60,
        height: 60,
        margin: 10,
        bottom: 0,
        zIndex: 100,
    },
});