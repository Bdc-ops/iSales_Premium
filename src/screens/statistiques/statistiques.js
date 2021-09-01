import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, DrawerLayoutAndroid, BackHandler, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Statistiques_navbar from '../../navbars/statistiques/statistiques_navbar';
import { LineChart, BarChart, PieChart, ProgressChart, ContributionGraph, StackedBarChart } from "react-native-chart-kit";
import { Spinner } from '../../Spinner';
import CardView from 'react-native-cardview';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import Menu from '../menu';
const IMG1 = require('../../res/graphs.png');
import RNFS from 'react-native-fs';
import moment from 'moment';


export default class Statistiques extends React.Component {

    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            CategoriesListe: [],
            bg_timer: null,
            menuOpen: false,
            count_client: [],
            count_commandes: [],
            count_produits: [],
            count_categories: [],
        };
    }
    handleMenu() {
        const { menuOpen } = this.state
        this.setState({
            menuOpen: !menuOpen
        })
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
    stat_clients() {
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        db.transaction(tx => {
            tx.executeSql(`SELECT count(*) as count,(SELECT name from clients where ref=(SELECT ref_client from commandes_client where commandes_client.id=commandes_produits.id_commandes_client)) as client from commandes_produits group by client order by count DESC`, [], (tx, results) => {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                    temp.push(results.rows.item(i));
                }
                this.setState({ count_client: temp });
                BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);

            });
        });
    }
    /*stat_produits() {
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        db.transaction(tx => {
            tx.executeSql(`SELECT count(*) as count FROM produits`, [], (tx, results) => {
            });
        });
    }*/
    stat_categories() {
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        db.transaction(tx => {
            tx.executeSql(`SELECT c.label,(SELECT count(*) FROM produits where produits.id_categorie=c.id_categorie) as count from categories c order by count DESC`, [], (tx, results) => {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                    temp.push(results.rows.item(i));
                }
                this.setState({ count_categories: temp });
                BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);

            });
        });
    }

    stat_commandes() {
        var db = openDatabase({ name: 'iSalesDatabase.db' });
        db.transaction(tx => {
            tx.executeSql(`SELECT label,count(*) as count from commandes_produits group by label order by count DESC`, [], (tx, results) => {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                    temp.push(results.rows.item(i));
                }
                this.setState({
                    count_produits: temp,
                    bg_timer: 1,
                });
                BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);

            });
        });
    }

    componentDidMount() {
        let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Statistiques \n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        this._isMounted = true;
        this.loadAllCategories();
    }
    loadAllCategories() {
        this.stat_clients();
        //this.stat_produits();
        this.stat_categories();
        this.stat_commandes();

    }
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        var db = openDatabase({ name: 'iSalesDatabase.db' });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
        this._isMounted = false;
        this.closeDB(db);
    }

    closeDB(db) {
        db.close(function () {
            console.log('database is closed ok');
        });
        let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Statistique : Couper la connexion avec la base de donnee\n-------";
        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
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




        const lb = [];
        const cn = [];
        this.state.count_categories.map((rowData) => {
            lb.push(rowData.label);
            cn.push(rowData.count);
        })
        const lb1 = [];
        const cn1 = [];
        this.state.count_produits.map((rowData) => {
            lb1.push(rowData.label);
            cn1.push(rowData.count);
        })

        const lb2 = [];
        const cn2 = [];
        this.state.count_client.map((rowData) => {
            lb2.push(rowData.client);
            cn2.push(rowData.count);
        })


        const data = {
            labels: [lb[0], lb[1], lb[2], lb[3], lb[4], lb[5], lb[6], lb[7], lb[8]],
            datasets: [
                {
                    data: [cn[0] ? cn[0] : 0, cn[1] ? cn[1] : 0, cn[2] ? cn[2] : 0, cn[3] ? cn[3] : 0, cn[4] ? cn[4] : 0, cn[5] ? cn[5] : 0, cn[6] ? cn[6] : 0, cn[7] ? cn[7] : 0, cn[8] ? cn[8] : 0]
                }
            ]

        };

        const data2 = {
            labels: [lb1[0], lb1[1], lb1[2], lb1[3], lb1[4], lb1[5], lb1[6], lb1[7]],
            datasets: [
                {
                    data: [cn1[0] ? cn1[0] : 0, cn1[1] ? cn1[1] : 0, cn1[2] ? cn1[2] : 0, cn1[3] ? cn1[3] : 0, cn1[4] ? cn1[4] : 0, cn1[5] ? cn1[5] : 0, cn1[6] ? cn1[6] : 0, cn1[7] ? cn1[7] : 0]
                }
            ]
        };

        const data3 = {
            labels: [lb2[0], lb2[1], lb2[2], lb2[3], lb2[4], lb2[5], lb2[6], lb2[7]],
            datasets: [
                {
                    data: [cn2[0] ? cn2[0] : 0, cn2[1] ? cn2[1] : 0, cn2[2] ? cn2[2] : 0, cn2[3] ? cn2[3] : 0, cn2[4] ? cn2[4] : 0, cn2[5] ? cn2[5] : 0, cn2[6] ? cn2[6] : 0, cn2[7] ? cn2[7] : 0]
                }
            ]

        };

        return (

            <DrawerLayoutAndroid
                ref={'DRAWER'}
                drawerWidth={350}
                drawerPosition={'left'}
                renderNavigationView={() => navigationView}>
                <ScrollView contentContainerStyle={styles.containerMain} >
                    {
                        state.bg_timer === null ?
                            (<Text></Text>)
                            :
                            (<Statistiques_navbar title={navigate}></Statistiques_navbar>)

                    }

                    <View style={styles.container}>
                        <View style={styles.containerResults}>

                            {
                                state.bg_timer === null ?
                                    (<View style={styles.loading_view}>
                                        <Image style={styles.img} source={IMG1} />
                                        <Text style={styles.loading_text}>Génération des graphes en cours</Text>
                                        <Spinner />
                                    </View>

                                    )
                                    :
                                    (
                                        <View style={styles.messageview}>

                                            <View style={styles.state_right}>
                                            <CardView cardElevation={10} cornerRadius={25} style={{ width: '95%', alignItems: 'center',marginBottom:25,backgroundColor:'orange' }}>
                                                <Text style={{padding:20}}>En cours de développement</Text>
                                            </CardView>

                                                <CardView cardElevation={10} cornerRadius={25} style={{ width: '95%', alignItems: 'center' }}>
                                                    <View style={{ width: '100%', marginLeft: 50, marginTop: 30, marginBottom: 30 }}>
                                                        <View style={{ flexDirection: 'row' }}>
                                                            <Icon name="fire" size={17} style={{ color: 'orange', marginRight: 5 }} /><Text style={{ marginBottom: 10, color: 'gray' }}>Nombre de produits par catégorie :</Text>
                                                        </View>
                                                        <View style={{ flexDirection: 'row' }}><Text>- {lb[0]} - </Text><Text style={{ color: '#00BFA6' }}>{cn[0]} Produits</Text></View>
                                                        <View style={{ flexDirection: 'row' }}><Text>- {lb[1]} - </Text><Text style={{ color: '#00BFA6' }}>{cn[1]} Produits</Text></View>
                                                        <View style={{ flexDirection: 'row' }}><Text>- {lb[2]} - </Text><Text style={{ color: '#00BFA6' }}>{cn[2]} Produits</Text></View>
                                                        <View style={{ flexDirection: 'row' }}><Text>. . . </Text></View>
                                                    </View>
                                                    <LineChart
                                                        data={data}
                                                        width={'530'}
                                                        height={400}
                                                        verticalLabelRotation={30}
                                                        yLabelsOffset={20}
                                                        withShadow={1}
                                                        yAxisInterval={6} // optional, defaults to 1
                                                        chartConfig={{
                                                            backgroundColor: "#e9e9e9",
                                                            backgroundGradientFrom: "#e9e9e9",
                                                            backgroundGradientTo: "#e8e8e8",
                                                            decimalPlaces: 0, // optional, defaults to 2dp
                                                            color: (opacity = 1) => `rgba(0, 191, 166, ${opacity})`,
                                                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                                            style: {
                                                                borderRadius: 16
                                                            },
                                                            propsForDots: {
                                                                r: "6",
                                                                strokeWidth: "2",
                                                                stroke: "#007263"
                                                            }
                                                        }}
                                                        bezier
                                                        style={{
                                                            marginVertical: 8,
                                                            borderRadius: 16,
                                                        }}
                                                    />
                                                </CardView>
                                            </View>


                                            <View style={styles.state_left}>

                                                <CardView cardElevation={10} cornerRadius={25} style={{ width: '95%', alignItems: 'center' }}>
                                                    <View style={{ width: '100%', marginLeft: 50, marginTop: 30, marginBottom: 30 }}>

                                                        <View style={{ flexDirection: 'row' }}>
                                                            <Icon name="fire" size={17} style={{ color: 'orange', marginRight: 5 }} /><Text style={{ marginBottom: 10, color: 'gray' }}>Meilleurs produits:</Text>
                                                        </View>
                                                        <View style={{ flexDirection: 'row' }}><Text>- {lb1[0]} - </Text><Text style={{ color: '#00BFA6' }}>{cn1[0]} Ventes</Text></View>
                                                        <View style={{ flexDirection: 'row' }}><Text>- {lb1[1]} - </Text><Text style={{ color: '#00BFA6' }}>{cn1[1]} Ventes</Text></View>
                                                        <View style={{ flexDirection: 'row' }}><Text>- {lb1[2]} - </Text><Text style={{ color: '#00BFA6' }}>{cn1[2]} Ventes</Text></View>
                                                        <View style={{ flexDirection: 'row' }}><Text>. . . </Text></View>
                                                    </View>
                                                    <BarChart
                                                        style={{
                                                            marginVertical: 8,
                                                            borderRadius: 16
                                                        }}
                                                        data={data2}
                                                        width={'530'} // from react-native
                                                        height={400}
                                                        verticalLabelRotation={30}
                                                        yLabelsOffset={20}
                                                        withShadow={1}
                                                        yAxisInterval={6} // optional, defaults to 1
                                                        chartConfig={{
                                                            backgroundColor: "#e9e9e9",
                                                            backgroundGradientFrom: "#e9e9e9",
                                                            backgroundGradientTo: "#e9e9e9",
                                                            decimalPlaces: 0, // optional, defaults to 2dp
                                                            color: (opacity = 1) => `rgba(0, 191, 166, ${opacity})`,
                                                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                                            style: {
                                                                borderRadius: 16
                                                            },
                                                            propsForDots: {
                                                                r: "6",
                                                                strokeWidth: "2",
                                                                stroke: "#007263"
                                                            }
                                                        }}
                                                        bezier
                                                        style={{
                                                            marginVertical: 8,
                                                            borderRadius: 16
                                                        }}
                                                    />

                                                </CardView>
                                            </View>



                                            <View style={styles.state_bottom}>

                                                <CardView cardElevation={10} cornerRadius={25} style={{ width: '95%', alignItems: 'center' }}>



                                                    <View style={{ width: '100%', marginLeft: 50, marginTop: 30, marginBottom: 30 }}>

                                                        <View style={{ flexDirection: 'row' }}>
                                                            <Icon name="fire" size={17} style={{ color: 'orange', marginRight: 5 }} /><Text style={{ marginBottom: 10, color: 'gray' }}>Clients fidèles :</Text>
                                                        </View>
                                                        <View style={{ flexDirection: 'row' }}><Text>- {lb2[0]} - </Text><Text style={{ color: '#00BFA6' }}>{cn2[0]} Commandes</Text></View>
                                                        <View style={{ flexDirection: 'row' }}><Text>- {lb2[1]} - </Text><Text style={{ color: '#00BFA6' }}>{cn2[1]} Commandes</Text></View>
                                                        <View style={{ flexDirection: 'row' }}><Text>- {lb2[2]} - </Text><Text style={{ color: '#00BFA6' }}>{cn2[2]} Commandes</Text></View>
                                                        <View style={{ flexDirection: 'row' }}><Text>. . . </Text></View>
                                                    </View>


                                                    <BarChart
                                                        style={{
                                                            marginVertical: 8,
                                                            borderRadius: 16
                                                        }}
                                                        data={data3}
                                                        width={'530'} // from react-native
                                                        height={400}
                                                        verticalLabelRotation={30}
                                                        yLabelsOffset={20}
                                                        withShadow={1}
                                                        yAxisInterval={6} // optional, defaults to 1
                                                        chartConfig={{
                                                            backgroundColor: "#e9e9e9",
                                                            backgroundGradientFrom: "#e9e9e9",
                                                            backgroundGradientTo: "#e9e9e9",
                                                            decimalPlaces: 0, // optional, defaults to 2dp
                                                            color: (opacity = 1) => `rgba(0, 191, 166, ${opacity})`,
                                                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                                            style: {
                                                                borderRadius: 16
                                                            },
                                                            propsForDots: {
                                                                r: "6",
                                                                strokeWidth: "2",
                                                                stroke: "#007263"
                                                            }
                                                        }}
                                                        bezier
                                                        style={{
                                                            marginVertical: 8,
                                                            borderRadius: 16
                                                        }}
                                                    />

                                                </CardView>
                                            </View>


                                        </View>

                                    )
                            }
                        </View>
                    </View>
                </ScrollView>
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

    },

    container: {
        flex: 1
    },
    cardViewStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        width: '90%',
        height: 50,
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
    state_right: {
        width: '95%',
        marginLeft: 20
    },
    state_left: {
        width: '95%',
        marginTop: 30,
        marginLeft: 20,
    },
    state_bottom: {
        width: '95%',
        marginTop: 30,
        marginLeft: 20,
        marginBottom: 30,
    },
    messageview: {
        paddingTop: 10,
        alignItems: 'center',
        marginTop: 30,
        justifyContent: 'center',
        width: '100%',

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
        marginBottom: 20,
    },
    loading_view: {
        alignItems: 'center',
        justifyContent: 'center',
    }
});