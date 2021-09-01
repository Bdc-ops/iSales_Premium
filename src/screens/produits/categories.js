import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, DrawerLayoutAndroid } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import RNFS from 'react-native-fs';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNBackgroundDownloader from 'react-native-background-downloader';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Produits_navbar from '../../navbars/produits/categories_navbar';
import CardView from 'react-native-cardview';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import { openDatabase } from 'react-native-sqlite-storage';
import Dashboard from '../dashboard/dashboard';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import Menu from '../menu';

const IMG1 = require('../../res/loading.png');

var { width } = Dimensions.get('window');


export default class Categories extends React.Component {

    constructor(props) {
        super(props);
        this._onScroll = this._onScroll.bind(this);
        this.state = {
            bg_timer: null,
            CategoriesListe: [],
            bg_timer: null,
            menuOpen: false,
            page_number: 15,
            contentOffsetY: 0,
            last: '',
            end_list: 0,
            msg_chargement: '',
            stat_filtre: 'ASC'
        };
    }

    handleMenu() {
        const { menuOpen } = this.state
        this.setState({
            menuOpen: !menuOpen
        })
    }


    componentDidMount() {
        let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " ===> Categories des produits \n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        this.loadAllCategories(15, this.state.stat_filtre);
    }
    /*componentWillMount() {
        var db = openDatabase({ name: 'iSalesDatabase.db' });
    }*/
    /*componentWillUnmount() {
        //this.closeDB(db);
    }*/

    /*
    closeDB(db) {
        db.close(function () {
            console.log('database is closed ok');
        });
    }
*/

    /*componentDidUpdate(prevProps) {
        this.loadAllCategories();
    }*/

    loadAllCategories(page, filtre) {
        let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Chargement des categories produits : Page " + (page / 15) + "\n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        db.transaction(tx => {
            //tx.executeSql(`SELECT c.id_categorie,c.label,(SELECT count(*) FROM produits where produits.id_categorie=c.id_categorie) as count from categories c order by c.label ${filtre} limit ${page}`, [], (tx, results) => {
            tx.executeSql(`SELECT c.id_categorie,c.label,(select categories.label from categories where categories.id_categorie=c.fk_parent) as parent,(SELECT count(*) FROM produits where produits.id_categorie=c.id_categorie) as count from categories c order by parent ${filtre} limit ${page}`, [], (tx, results) => {
                    var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                    temp.push(results.rows.item(i));
                }
                if (results.rows.length == this.state.last) {
                    this.setState({ end_list: 1 });
                }

                this.setState({
                    CategoriesListe: temp,
                    bg_timer: 1,
                    page_number: page,
                    last: results.rows.length,
                    msg_chargement: ''
                });
            });
        });
    }

    _nextbutton() {
        let newpage = this.state.page_number + 5;
        this.loadAllCategories(newpage, this.state.stat_filtre);
        console.log('next page : ' + newpage);
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

    showProduits() {
        console.log('ok');
    }
    render() {
        const state = this.state;
        const { navigate } = this.props.navigation;
        const navigationView = (
            <Menu title={navigate} />
        );

        return (

            <DrawerLayoutAndroid
                ref={'DRAWER'}
                drawerWidth={350}
                drawerPosition={'left'}
                renderNavigationView={() => navigationView}>
                <ScrollView contentContainerStyle={styles.containerMain} onScroll={this._onScroll}>
                    <Produits_navbar title={navigate}></Produits_navbar>
                    <View style={styles.container}>
                        <View style={styles.containerResults}>

                            {
                                state.bg_timer === null ?
                                    (<View style={styles.loading_view}>
                                        <Image style={styles.img} source={IMG1} />
                                        <Text style={styles.loading_text}>chargement en cours ...</Text>
                                    </View>

                                    )
                                    :
                                    (
                                        <CardView cardElevation={5} cornerRadius={25} style={styles.cardViewStyle}>
                                            <TouchableOpacity style={styles.cardViewStyle} onPress={() => navigate('ShowAllProduits')}>
                                                <View style={styles.details}>
                                                    <View style={styles.cat_name}>
                                                        <Icon name="boxes" size={20} style={styles.iconDetails} />
                                                        <Text style={styles.categoriesname}>Toutes les produits</Text>
                                                    </View>

                                                </View>
                                            </TouchableOpacity>
                                        </CardView>
                                    )
                            }



                            {

                                state.CategoriesListe.length > 0 ?
                                    state.CategoriesListe.map((rowData, index) => (
                                        rowData.parent ?
                                        (
                                            <CardView key={index} cardElevation={5} cornerRadius={25} style={styles.cardViewStyle}>
                                            <TouchableOpacity style={styles.cardViewStyle} onPress={() => rowData.count > 0 ? navigate('ShowProduits', { id_categorie: rowData.id_categorie, label: rowData.label }) : console.log('La categorie est vide')}>
                                                <View style={styles.details}>
                                                    <View style={styles.cat_name}>
                                                        <Text style={styles.categoriesname}>
                                                            <Icon name="tags" size={17} style={{color:'#00BFA6',marginRight:20}}/> <Text style={{color:'#00BFA6',fontSize:16}}>{rowData.parent}</Text> <Icon name="chevron-right" size={15} style={{color:'#00BFA6'}} /> <Text>{rowData.label}</Text>
                                                        </Text>
                                                    </View>
                                                    {
                                                        rowData.count > 0 ?
                                                            (
                                                                <View style={styles.cat_count}>
                                                                    <Text style={styles.categoriesCount}>{rowData.count}</Text>
                                                                </View>
                                                            )
                                                            :
                                                            (
                                                                <View style={styles.cat_count_null}>
                                                                    <Text style={styles.categoriesCount}>{rowData.count}</Text>
                                                                </View>
                                                            )
                                                    }
                                                </View>
                                            </TouchableOpacity>
                                        </CardView>
                                        ):
                                        rowData.parent === null && rowData.count > 0 ?
                                        (
                                            <CardView key={index} cardElevation={5} cornerRadius={25} style={styles.cardViewStyle}>
                                            <TouchableOpacity style={styles.cardViewStyle} onPress={() => rowData.count > 0 ? navigate('ShowProduits', { id_categorie: rowData.id_categorie, label: rowData.label }) : console.log('La categorie est vide')}>
                                                <View style={styles.details}>
                                                    <View style={styles.cat_name}>
                                                        <Text style={styles.categoriesname}>
                                                            <Icon name="tags" size={17} style={{color:'#00BFA6',marginRight:20}}/> <Text>{rowData.label}</Text>
                                                        </Text>
                                                    </View>
                                                    {
                                                        rowData.count > 0 ?
                                                            (
                                                                <View style={styles.cat_count}>
                                                                    <Text style={styles.categoriesCount}>{rowData.count}</Text>
                                                                </View>
                                                            )
                                                            :
                                                            (
                                                                <View style={styles.cat_count_null}>
                                                                    <Text style={styles.categoriesCount}>{rowData.count}</Text>
                                                                </View>
                                                            )
                                                    }
                                                </View>
                                            </TouchableOpacity>
                                        </CardView>
                                        )
                                        :(<Text key={index} style={{display: 'none'}}></Text>)
                                        

                                    )):(<Text style={{display: 'none'}}></Text>)

                            }
                            <Text>{this.state.msg_chargement}</Text>


                        </View>
                    </View>
                </ScrollView>
                {
                    state.bg_timer === 1 && state.CategoriesListe.length > 0 ?
                        (
                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', }}>
                                <View style={styles.PaginationNextButtonContainer}>
                                    <TouchableOpacity style={styles.PaginationUpButton} activeOpacity={.5}
                                        onPress={() => { this.setState({ stat_filtre: 'ASC' }); this.loadAllCategories(this.state.page_number, 'ASC') }}>
                                        <Icon name="sort-amount-up" size={20} style={styles.icons} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.PaginationUpButton} activeOpacity={.5}
                                        onPress={() => { this.setState({ stat_filtre: 'DESC' }); this.loadAllCategories(this.state.page_number, 'DESC') }}>
                                        <Icon name="sort-amount-down" size={20} style={styles.icons} />
                                    </TouchableOpacity>

                                </View>
                            </View>
                        )
                        : (<Text></Text>)
                }
            </DrawerLayoutAndroid>
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
    details: {
        flexDirection: 'row',
    },
    containerMain: {
        flexGrow: 1,
        justifyContent: 'center',
        backgroundColor: '#ffffff',

    },
    containerResults: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50

    },
    PaginationNextButtonContainer: {
        //flexDirection: 'row',
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

    cardViewStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        width: '90%',
        height: 70,
        margin: 5,
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

    icons: {
        color: '#ffffff',
        alignItems: 'flex-end'
    },
    circle: {
        margin: 20,
        width: 100,
        height: 100,
        borderRadius: 100 / 2,
        backgroundColor: '#CED4DA',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoriesname: {
        fontSize: 20,
        width: '93%',
    },
    categoriesCount: {
        color: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 15,

    },
    cat_count: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 12,
        paddingBottom: 15,
        backgroundColor: '#00BFA6',
        borderRadius: 50,
        width: 30,
        height: 30,
    },
    cat_count_null: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 12,
        paddingBottom: 15,
        backgroundColor: '#d64541',
        borderRadius: 50,
        width: 30,
        height: 30,
    },
    cat_name: {
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: 20,
        width: '93%',
    },
    iconDetails: {
        marginRight: 10,
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
    }
});