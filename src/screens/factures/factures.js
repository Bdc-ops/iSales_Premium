import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, TextInput, DrawerLayoutAndroid } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Factures_navbar from '../../navbars/factures/factures_navbar';
import CardView from 'react-native-cardview';
import moment from 'moment';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import DatePicker from 'react-native-datepicker';
import DialogAndroid from 'react-native-dialogs';
import ButtonSpinner from 'react-native-button-spinner';
import Menu from '../menu';
const IMG1 = require('../../res/loading.png');
const IMG2 = require('../../res/factures_download.png');
const notfound = require('../../res/notfound.png');
const avatar_image = require('../../res/avatar.png');


export default class Factures extends React.Component {

    constructor(props) {
        super(props);
        this._onScroll = this._onScroll.bind(this);
        this._isMounted = false;
        this.state = {
            factures_liste: [],
            datefin: '',
            datedebut: '',
            rechercheinput: '',
            clientsliste: [],
            selectedclient: [],
            pressed: 0,
            found: 0,
            foundR: 0,
            disablebutton: true,
            bg_timer: null,
            SearchData: [],
            page_number: 5,
            menuOpen: false,
            records: '',
            contentOffsetY: 0,
            continue: 0,
            msg_chargement: '',
            scroll_index: 0,
        };

    }

    componentDidMount() {
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        this._isMounted = true;
        this.loadallfactures(0, 0, 5);

    }

    /*componentWillMount() {
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        this._isMounted = true;
    }*/

    componentWillUnmount() {
        this._isMounted = false;
        //this.closeDB(db);
    }

    closeDB(db) {
        db.close(function () {
            console.log('database is closed ok');
        });
    }
    handleMenu() {
        const { menuOpen } = this.state
        this.setState({
            menuOpen: !menuOpen
        })
    }



    async loadallfactures(ind, resolve, page) {
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        console.log('Loading all factures data ########################');
        console.log('Page : '+page);
        await db.transaction(async (tx_f) => {
            tx_f.executeSql(`SELECT ff.*,(SELECT count(*) FROM lines_facture where lines_facture.id_facture=ff.id) as count,(SELECT name from clients where clients.ref=ff.socid) as clientname from factures ff where count!=0 order by ff.date_creation DESC limit ${page}`, [], (tx_f, results) => {
                var temp_fac = [];
                for (let i = 0; i < results.rows.length; ++i) {
                    temp_fac.push(results.rows.item(i));
                    //console.log(results.rows.item(i));
                }
                this.setState({ factures_liste: temp_fac, bg_timer: 1, pressed: 0, continue: results.rows.length, msg_chargement: '' });
                console.log('total : ' + this.state.continue);
                if (ind === 1) { resolve("api ok"); }
                console.log('Page : '+page);

            });
        });
    }



    async listclients() {
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        const { rechercheinput } = this.state;
        if (rechercheinput) {
            return new Promise(async (resolve, reject) => {
                this.setState({ found: 0 });
                db.transaction(async (tx) => {
                    tx.executeSql(`SELECT name,code_client,ref FROM clients where name LIKE '${rechercheinput}%' OR name LIKE '%${rechercheinput}' OR name LIKE '%${rechercheinput}%' OR name LIKE '${rechercheinput}' OR ref LIKE '${rechercheinput}%' OR ref LIKE '%${rechercheinput}' OR ref LIKE '%${rechercheinput}%' OR ref LIKE '${rechercheinput}'`, [], async (tx, results) => {
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i) {
                            temp.push(results.rows.item(i));
                        }
                        if (results.rows.length > 0) {
                            this.setState({ clientsliste: temp, found: 1, });
                            resolve("api ok");
                            const { selectedItem } = await DialogAndroid.showPicker('Veuillez selectionner un client', null, {
                                positiveText: 'Ok', // this is what makes disables auto dismiss
                                cancelable: false,
                                type: DialogAndroid.listRadio,
                                selectedId: 'clientslist',
                                items:
                                    this.state.clientsliste.map((rowData, index) => (
                                        {
                                            label: rowData.name,
                                            id: rowData.ref,
                                        }
                                    ))
                            });
                            if (selectedItem) {
                                this.setState({ selectedclient: selectedItem, disablebutton: false, rechercheinput: selectedItem.label });
                            }
                        } else {
                            this.setState({ found: 2 });
                            resolve("api ok");
                        }

                    });
                });
            })
        }
    }


    async searchfacture() {
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        const { rechercheinput, datedebut, datefin } = this.state;
        return new Promise(async (resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(`SELECT count(*) as count_records FROM factures`, [], (tx, results) => {
                    this.setState({ records: results.rows.item(0).count_records, scroll_index: 1 });
                });
            });

            if ((rechercheinput) && ((datedebut) && (datefin))) {
                this.setState({ foundR: 0, declancheur: 1 });
                db.transaction(tx => {
                    tx.executeSql(`SELECT ff.*,(SELECT count(*) FROM lines_facture where lines_facture.id_facture=ff.id) as count,(SELECT name from clients where clients.ref=ff.socid) as clientname from factures ff where count!=0 AND (date(ff.date_creation, 'unixepoch', 'localtime') BETWEEN '${moment(datedebut,"DD-MM-YYYY").format("YYYY-MM-DD")}' AND '${moment(datefin,"DD-MM-YYYY").format("YYYY-MM-DD")}') AND (clientname LIKE '${rechercheinput}%' OR clientname LIKE '%${rechercheinput}' OR clientname LIKE '%${rechercheinput}%' OR clientname LIKE '${rechercheinput}')`, [], (tx, results) => {
                        var temp = [];
                        if (results.rows.length === 0) { this.setState({ foundR: 1, pressed: 1, }) }
                        for (let i = 0; i < results.rows.length; ++i) {
                            temp.push(results.rows.item(i));
                            console.log(results.rows.item(i));
                        }
                        this.setState({
                            SearchData: temp,
                            foundR: 2,
                            pressed: 2,
                        });
                        resolve("api ok");
                        this.setState({ records: '' })
                    });
                });
            } else if ((rechercheinput === '') && ((datedebut) && (datefin))) {
                this.setState({ foundR: 0, declancheur: 1 });
                db.transaction(tx => {

                    if (moment(datedebut, 'DD-MM-YYYY').unix() === moment(datefin, 'DD-MM-YYYY').unix()){
                        console.log(`date debut = date fin : ${datedebut}`);
                        console.log(`SELECT ff.*,(SELECT count(*) FROM lines_facture where lines_facture.id_facture=ff.id) as count,(SELECT name from clients where clients.ref=ff.socid) as clientname from factures ff where count!=0 AND ff.date_creation = '${moment(datedebut, 'DD-MM-YYYY').unix()}'`);
                        tx.executeSql(`SELECT ff.*,(SELECT count(*) FROM lines_facture where lines_facture.id_facture=ff.id) as count,(SELECT name from clients where clients.ref=ff.socid) as clientname from factures ff where count!=0 AND date(ff.date_creation, 'unixepoch', 'localtime') = '${moment(datedebut,"DD-MM-YYYY").format("YYYY-MM-DD")}'`, [], (tx, results) => {
                            var temp = [];
                            if (results.rows.length === 0) { this.setState({ foundR: 1, pressed: 1 }) }
                            for (let i = 0; i < results.rows.length; ++i) {
                                temp.push(results.rows.item(i));
                                console.log(results.rows.item(i));
                            }
                            this.setState({
                                SearchData: temp,
                                foundR: 2,
                                pressed: 2,
                            });
                            resolve("api ok");
                            this.setState({ records: '' })
                        });
                    }else{
                        console.log('date debut != date fin');

                        tx.executeSql(`SELECT ff.*,(SELECT count(*) FROM lines_facture where lines_facture.id_facture=ff.id) as count,(SELECT name from clients where clients.ref=ff.socid) as clientname from factures ff where count!=0 AND (date(ff.date_creation, 'unixepoch', 'localtime') BETWEEN '${moment(datedebut,"DD-MM-YYYY").format("YYYY-MM-DD")}' AND '${moment(datefin,"DD-MM-YYYY").format("YYYY-MM-DD")}')`, [], (tx, results) => {
                            var temp = [];
                            if (results.rows.length === 0) { this.setState({ foundR: 1, pressed: 1 }) }
                            for (let i = 0; i < results.rows.length; ++i) {
                                temp.push(results.rows.item(i));
                                console.log(results.rows.item(i));
                            }
                            this.setState({
                                SearchData: temp,
                                foundR: 2,
                                pressed: 2,
                            });
                            resolve("api ok");
                            this.setState({ records: '' })
                        });
                    }
                    
                });
            } else if ((rechercheinput) && ((datedebut === '') && (datefin === ''))) {
                this.setState({ foundR: 0, declancheur: 1 });
                db.transaction(tx => {
                    tx.executeSql(`SELECT ff.*,(SELECT count(*) FROM lines_facture where lines_facture.id_facture=ff.id) as count,(SELECT name from clients where clients.ref=ff.socid) as clientname from factures ff where count!=0 AND (clientname LIKE '${rechercheinput} %' OR clientname LIKE '% ${rechercheinput}' OR clientname LIKE '% ${rechercheinput} %' OR clientname LIKE '${rechercheinput}')`, [], (tx, results) => {
                        var temp = [];
                        if (results.rows.length === 0) { this.setState({ foundR: 1, pressed: 1 }) }
                        for (let i = 0; i < results.rows.length; ++i) {
                            temp.push(results.rows.item(i));
                            console.log(results.rows.item(i));
                            console.log('here');
                        }
                        this.setState({
                            SearchData: temp,
                            foundR: 2,
                            pressed: 2,
                        });
                        resolve("api ok");
                        this.setState({ records: '' })
                    });
                });
            }
        });
    }

    resetinputs() {
          this.rechercheinput.clear();
          this.setState({ datedebut: '', datefin: '',rechercheinput:'', scroll_index: 0,foundR: 0, declancheur: true,pressed: 0,found: 0 });
          this.loadallfactures(0, 0, 5);
          //this._nextbutton();


    }
    async backinput() {
        return new Promise(async (resolve) => {
            this.loadallfactures(1, resolve);
        })
    }

    _Showfacture(id) {
        this.props.navigation.navigate('ShowFacture', { id: id });
    }

    _nextbutton() {
        const newpage = this.state.page_number + 5;
        this.setState({ page_number: newpage });
        this.loadallfactures(0, 0, newpage);
        console.log('next : ' + newpage);
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
        const element = (ref, page_number) => (
            <Icon name="eye" size={25} style={styles.icon1} />
        );
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

                <ScrollView contentContainerStyle={styles.containerMain} ref='_scrollView'  onScroll={state.scroll_index == 0 ? this._onScroll : ''}>
                    <Factures_navbar title={navigate}></Factures_navbar>
                    <View style={styles.container}>
                        <View style={styles.containerResults}>


{
   state.factures_liste.length > 0 ?
    (
        <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle0}>
        <View style={styles.searchc}>
            <View style={styles.SearchContainer}>

                <View style={styles.SearchFilter}>


                    <View style={styles.dates}>
                        <DatePicker
                            date={this.state.datedebut}
                            style={{ width: '48%' }}
                            mode="date"
                            placeholder="Date de début"
                            format="DD-MM-YYYY"
                            confirmBtnText="Confirmer"
                            cancelBtnText="Annuler"
                            customStyles={{
                                dateIcon: { position: 'absolute', left: 0, top: 4, marginLeft: 0 },
                                dateInput: { marginLeft: 36, borderColor: '#00BFA6', borderWidth: 1, borderRadius: 25, height: 30 }
                            }}
                            onDateChange={(date) => { this.setState({ datedebut: date }) }}
                        />

                        <DatePicker
                            date={this.state.datefin}
                            style={{ width: '48%' }}
                            mode="date"
                            placeholder="Date de fin"
                            format="DD-MM-YYYY"
                            confirmBtnText="Confirmer"
                            cancelBtnText="Annuler"
                            customStyles={{
                                dateIcon: { position: 'absolute', left: 0, top: 4, marginLeft: 0 },
                                dateInput: { marginLeft: 36, borderColor: '#00BFA6', borderWidth: 1, borderRadius: 25, height: 30 }
                            }}
                            onDateChange={(date) => { this.setState({ datefin: date }) }}
                        />

                    </View>

                    <View style={styles.SearchContainer1}>
                        <TextInput style={styles.inputsearchfactures} placeholder="Selectionner un client"
                            ref={input => { this.rechercheinput = input }} onChangeText={(text) => this.setState({ rechercheinput: text })}>{this.state.rechercheinput}</TextInput>
                        <ButtonSpinner positionSpinner={'centered-without-text'} styleSpinner={{ style: { textAlign: 'center', color: '#00BFA6' } }}
                            onPress={this.listclients.bind(this)} style={styles.SubmitButtonStyleClient}>
                            <Icon name="users" size={15} style={styles.iconSearchClient} />
                        </ButtonSpinner>
                    </View>
                </View>
                <View style={styles.searchButton}>
                    <View style={styles.searchb}>
                        <ButtonSpinner positionSpinner={'centered-without-text'} styleSpinner={{ style: { textAlign: 'center', color: '#ffffff', } }} style={styles.SubmitButtonStyle}
                            onPress={this.searchfacture.bind(this, 5)}>
                            <Icon name="search" size={15} color="#900" style={styles.iconSearch} />
                        </ButtonSpinner>
                        <ButtonSpinner positionSpinner={'centered-without-text'} styleSpinner={{ style: { textAlign: 'center', color: '#00BFA6', } }} style={styles.SubmitButtonStyleReset}
                            onPress={this.resetinputs.bind(this)}>
                            <Icon name="trash" size={15} color="#900" style={styles.iconSearchClient} />
                        </ButtonSpinner>
                    </View>
                </View>
            </View>
            <Text>{this.state.records ? `Recherche dans ${this.state.records} Factures ...` : ''}</Text>


        </View>
    </CardView>
    )
    :
    (<Text></Text>)
}

                            {
                                state.bg_timer === null ?
                                    (
                                        <View style={styles.loading_view}>
                                            <Image style={styles.img} source={IMG1} />
                                            <Text style={styles.loading_text}>Chargement en cours ...</Text>
                                        </View>

                                    )
                                    :
                                    (<Text></Text>)
                            }


                            {
                                state.bg_timer === 1 && state.continue === 0 ?
                                    (<View style={styles.loading_view}>
                                        <Image style={styles.img} source={IMG2} />
                                        <Text style={styles.loading_text}>Veuillez télécharger les factures en utilisant le bouton de téléchargement en haut <Icon name="cloud-upload-alt" size={15} /></Text>
                                    </View>)
                                    :
                                    (<Text></Text>)
                            }

                            {
                                state.SearchData.length > 0 && state.pressed === 2 ?
                                    state.SearchData.map((rowData, index) => (
                                        <CardView key={index} cardElevation={10} cornerRadius={5} style={styles.cardViewStyle}>
                                            <View style={styles.cardViewStyle1}>
                                                <View style={styles.order}>
                                                    <TouchableOpacity onPress={() => this._Showfacture(rowData.id)}>
                                                        <View style={styles.ic_and_details}>
                                                            <View style={styles.cname}>
                                                                <Text style={styles.entreprisename}>{rowData.clientname}</Text>
                                                            </View>
                                                            <View style={styles.cref}>
                                                                <Text style={styles.ref}>{rowData.ref}</Text>
                                                            </View>

                                                        </View>
                                                        <View style={styles.ic_and_details}>
                                                            <Icon name="boxes" size={15} style={styles.iconDetails} />
                                                            <Text>{rowData.count} Produit(s)</Text>
                                                        </View>
                                                        <View style={styles.ic_and_details}>
                                                            <Icon name="calendar-alt" size={15} style={styles.iconDetails} />
                                                            <Text style={{ marginBottom: 10 }}>Faite le :
                                                            {
                                                                // moment(new Date(rowData.date_creation * 1000)).format('DD-MM-YYYY') ?moment(new Date(rowData.date_creation * 1000)).format('DD-MM-YYYY')
                                                                rowData.date_creation ?
                                                                moment(new Date(rowData.date_creation * 1000)).format('DD-MM-YYYY')
                                                                :
                                                                '----'
                                                                }
                                                            </Text>
                                                        </View>



                                                        <View style={{ borderBottomColor: '#00BFA6', borderBottomWidth: 1, marginRight: 10 }} />
                                                        <View style={styles.pricedetails}>
                                                            <View style={styles.price}>
                                                                <Text>Total HT : {(parseFloat(rowData.total_ht)).toFixed(2)} €</Text>
                                                            </View>
                                                            <View style={styles.billedstate}>
                                                            {rowData.etat == '1' ? (<Text style={styles.billedtext_no}>Impayée</Text>) : (<Text style={styles.billedtext_ok}>Payée</Text>)}
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>

                                                    <View style={styles.butons_commande}>
                                                        {rowData.issent === 0 ? (<Text style={styles.notif}><Icon name="cloud-upload-alt" size={20} style={styles.notif_icon} /></Text>) : (<Text style={styles.notif}></Text>)}
                                                    </View>

                                                </View>
                                            </View>
                                        </CardView>
                                    ))


                                    : state.pressed === 0 ?
                                        (
                                            state.factures_liste.map((rowData, index) => (

                                                <CardView key={index} cardElevation={10} cornerRadius={5} style={styles.cardViewStyle}>
                                                    <View style={styles.cardViewStyle1}>
                                                        <View style={styles.order}>
                                                            <TouchableOpacity onPress={() => this._Showfacture(rowData.id)}>
                                                                <View style={styles.ic_and_details}>
                                                                    <View style={styles.cname}>
                                                                        <Text style={styles.entreprisename}>{rowData.clientname}</Text>
                                                                    </View>
                                                                    <View style={styles.cref}>
                                                                        <Text style={styles.ref}>{rowData.ref}</Text>
                                                                    </View>

                                                                </View>
                                                                <View style={styles.ic_and_details}>
                                                                    <Icon name="boxes" size={15} style={styles.iconDetails} />
                                                                    <Text>{rowData.count} Produit(s)</Text>
                                                                </View>
                                                                <View style={styles.ic_and_details}>
                                                                    <Icon name="calendar-alt" size={15} style={styles.iconDetails} />
                                                                    <Text style={{ marginBottom: 10 }}>Faite le :
                                                                    {
                                                                            //moment(new Date(rowData.date_creation * 1000)).format('DD-MM-YYYY') ?moment(new Date(rowData.date_creation * 1000)).format('DD-MM-YYYY')
                                                                            rowData.date_creation?
                                                                            moment(new Date(rowData.date_creation * 1000)).format('DD-MM-YYYY')
                                                                            :
                                                                            '----'
                                                                        }
                                                                    </Text>
                                                                </View>

                                                                <View style={{ borderBottomColor: '#00BFA6', borderBottomWidth: 1, marginRight: 10 }} />
                                                                <View style={styles.pricedetails}>
                                                                    <View style={styles.price}>
                                                                        <Text>Total HT : {parseFloat(rowData.total_ht).toFixed(2)} €</Text>
                                                                    </View>
                                                                    <View style={styles.billedstate}>
                                                                    {rowData.etat == '1' ? (<Text style={styles.billedtext_no}>Impayée</Text>) : (<Text style={styles.billedtext_ok}>Payée</Text>)}
                                                                    </View>
                                                                </View>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </CardView>
                                            ))
                                        )
                                        :
                                        (
                                            <View style={styles.searching_view}>
                                                <Image style={styles.img} source={notfound} />
                                                <Text style={styles.searchnotfound_text}>Recherche non trouvée</Text>
                                            </View>
                                        )




                            }

                            <Text>{this.state.msg_chargement}</Text>

                        </View>
                    </View>

                </ScrollView>


                {
                    state.bg_timer === 1 && state.factures_liste.length > 0 ?
                        (
                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', }}>
                                <View style={styles.PaginationNextButtonContainer}>
                                    {/*<TouchableOpacity style={styles.CenteredSyncButton} activeOpacity={.5}
                                        onPress={() => this.resetinputs()}>
                                        <Icon name="sync" size={20} style={styles.icons} />
                                    </TouchableOpacity>*/}
                                    <TouchableOpacity style={styles.PaginationUpButton} activeOpacity={.5}
                                        onPress={() => { this.refs._scrollView.scrollTo({ x: 0, y: 0, animated: true }); }}>
                                        <Icon name="arrow-up" size={20} style={styles.icons} />
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
        width: '100%',
        backgroundColor: '#ffffff',
    },


    cardViewStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        width: '90%',
        height: 220,
        marginBottom: 20,

    },

    cardViewStyle0: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width: '90%',
        height: 140,
        marginBottom: 20,
    },

    cardViewStyle1: {
        paddingTop: 20,
        alignItems: 'center',
        flexDirection: 'row',
        width: '95%',
        //height: 150,
    },

    butons_commande: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginTop: 30,
    },
    notif: {
        position: 'absolute',
        right: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 10,

    },
    notif_icon: {
        color: '#e1b12c',
        borderRadius: 5,
        padding: 5,
    },
    submit_on: {
        backgroundColor: '#00BFA6',
        borderRadius: 25,
        height: 35,
        padding: 2,
        marginBottom: 20,
        textAlign: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        width: 250,
        position: 'absolute',
        left: 0,

    },
    dates: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icons: {
        color: '#ffffff',
        alignItems: 'flex-end'
    },
    order: {
        //alignItems: 'center',
        margin: 20,
        width: '100%'
    },
    iconDetails: {
        marginRight: 10,
        color: '#00BFA6',
    },

    iconValiderpanier: {
        fontSize: 15,
        color: '#ffffff',
        paddingLeft: 8,
        paddingRight: 8,
    },
    iconPanier: {
        fontSize: 15,
        color: '#ffffff',
        paddingRight: 8,
    },
    entreprisename: {
        color: '#00BFA6',
        fontSize: 20,
        //marginBottom: 15,
    },
    pricedetails: {
        flexDirection: 'row',
        width: '100%',
    },
    price: {
        width: '75%',
    },
    billedstate: {
        width: '25%',
    },
    billedtext_ok: {
        color: '#00BFA6',
        fontSize: 15,
        position: 'absolute',
        right: 10
    },
    billedtext_no: {
        color: '#d64541',
        fontSize: 15,
        position: 'absolute',
        right: 10
    },
    ic_and_details: {
        flexDirection: 'row',
        margin: 3,
        //alignItems: 'center',
    },
    cname: {
        width: '60%',
    },
    cref: {
        width: '40%',
    },
    ref: {
        position: 'absolute',
        right: 10,
        top: 0,
        backgroundColor: '#e9e9e9',
        borderRadius: 5,
        padding: 5
    },
    ref_null: {
        position: 'absolute',
        right: 10,
        top: 0,
        backgroundColor: '#e1b12c',
        borderRadius: 5,
        padding: 5
    },
    SearchContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%',
    },
    SearchContainer1: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%',
    },
    SubmitButtonStyle: {
        backgroundColor: '#00BFA6',
        margin: 5,
        borderRadius: 25,
        height: 30,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        width: '95%',
    },
    SubmitButtonStyleClient: {
        //padding: 10,
        backgroundColor: '#e9e9e9',
        borderRadius: 50,
        height: 30,
        width: '25%'
    },
    SubmitButtonStyleReset: {
        backgroundColor: '#e9e9e9',
        margin: 5,
        borderRadius: 25,
        height: 30,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        width: '95%',
    },
    iconSearch: {
        color: '#ffffff',
        textAlign: 'center',
        paddingTop: 5,
        paddingBottom: 5,
    },
    iconSearchClient: {
        color: '#00BFA6',
        textAlign: 'center',
        paddingTop: 5,
        paddingBottom: 5,
    },
    inputsearchfactures: {
        color: '#00BFA6',
        //marginRight: 20,
        textAlign: 'left',
        borderColor: '#00BFA6',
        borderWidth: 1,
        borderRadius: 25,
        color: '#00BFA6',
        width: '75%',
        height: 30,
        paddingLeft: 25,
        paddingTop: 3,
        paddingBottom: 3,

    },
    searchb: {
        width: '100%',
        height: '100%',
    },
    clientnotfound: {
        alignItems: 'center',
        justifyContent: 'center',
        color: '#d64541',
    },
    SearchFilter: {
        width: '75%'
    },
    searchButton: {
        width: '20%',
        height: 80,
    },
    searchc: {
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
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
    img: {
        width: 350,
        height: 240,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    searchnotfound_text: {
        alignItems: 'center',
        justifyContent: 'center',
        color: '#d64541',
    },
    searching_view: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewback: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        height: '35%'
    },
    SubmitButtonStyleBack: {
        width: '95%',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 5,
        paddingBottom: 5,
    },
    PaginationNextButtonContainer: {
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
      CenteredSyncButton: {
        alignItems: 'center',
        paddingTop: 18,
        paddingBottom: 15,
        backgroundColor: '#e0e0e0',
        borderRadius: 50,
        width: 60,
        height: 60,
        margin: 10,
        bottom: 0,
        zIndex: 100,
      },
});