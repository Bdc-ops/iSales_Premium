import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, DrawerLayoutAndroid, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Clients_navbar from '../../navbars/clients/clients_navbar';
import CardView from 'react-native-cardview';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import RNFS from 'react-native-fs';
import moment from 'moment';
import Menu from '../menu';

const IMG1 = require('../../res/loading.png');

const avatar_image = require('../../res/avatar.png');
var { width } = Dimensions.get('window');

export default class Clients extends React.Component {
  constructor(props) {
    super(props);
    this._onScroll = this._onScroll.bind(this);
    this._isMounted = false;
    this.state = {
      tableData: [],
      bg_timer: null,
      page_number: 5,
      lastref: null,
      menuOpen: false,
      contentOffsetY: 0,
      msg_chargement: '',
    };
  }


  componentDidMount() {
    console.log('###############################################');
    console.log('#####  Liste des Clients #####');
    console.log('###############################################');
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    this.loadAllData(5);
    this._isMounted = true;

  }


  componentWillUnmount() {
    this.closeDB(db);
    this._isMounted = false;

  }


  closeDB(db) {
    db.close(function () {
      console.log('database is closed ok');
    });
    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Clients : Couper la connexion avec la base de donnee\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
  }


  handleMenu() {
    const { menuOpen } = this.state
    this.setState({
      menuOpen: !menuOpen
    })
  }

  loadAllData(page) {
    let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Client : page: " + (page / 5) + "\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    db.transaction(tx => {
      tx.executeSql(`SELECT name,country,town,ref,code_client FROM clients ORDER BY id DESC limit ${page}`, [], (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
          //console.log(results.rows.item(i));
        }
        this.setState({
          tableData: temp,
          bg_timer: 1,
          page_number: page,
          //token: token,
        });
      });
    });
  }

  _nextbutton() {
    const newpage = this.state.page_number + 5;
    this.loadAllData(newpage);
    console.log('next : ' + newpage);
  }


  _Showprofile(index) {
    this.props.navigation.navigate('ShowClient', { ref_client: index });
    let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Client : ouvrire fiche client, ref:" + index + "\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
  }

  _synclist() {
    this.loadAllData(this.state.page_number);
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
    const element = (ref, page_number) => (<Icon name="eye" size={25} style={styles.icon1} />);
    const { navigate } = this.props.navigation;
    const drawer = this.refs['DRAWER'];

    const navigationView = (
      <Menu title={navigate} />
    );

    return (
      <View style={styles.containerMain}>

        <DrawerLayoutAndroid
          ref={'DRAWER'}
          drawerWidth={350}
          drawerPosition={'left'}
          renderNavigationView={() => navigationView}>

          <ScrollView contentContainerStyle={styles.containerMain} ref='_scrollView' onScroll={this._onScroll}>


            <Clients_navbar passProps={drawer} title={navigate} subtitle={state.lastref}></Clients_navbar>
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

                {state.tableData.map((rowData, index) => (

                  <CardView key={index} cardElevation={10} cornerRadius={5} style={styles.cardViewStyle}>
                    <TouchableOpacity style={styles.cardViewStyle}
                      onPress={() => this._Showprofile(rowData.ref)}>
                      <Image style={styles.circle} source={avatar_image} />
                      <View style={styles.details}>

                        <View style={styles.entreprise}>
                          <Text style={styles.entreprisename} numberOfLines={1}>{rowData.name ? rowData.name : '- - -'}
                          </Text>

                        </View>

                        <View style={styles.country}>
                          <Icon name="globe-europe" size={15} style={styles.iconDetails} />
                          <Text>{rowData.country ? rowData.country : '- - -'}</Text>
                        </View>
                        <View style={styles.city}>
                          <Icon name="city" size={15} style={styles.iconDetails} />
                          <Text>{rowData.town ? rowData.town : '- - -'}</Text>
                        </View>
                      </View>

                    </TouchableOpacity>

                  </CardView>
                ))}
              </View>
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'center', margin: 20 }}>
              <Text>{this.state.msg_chargement}</Text>

            </View>
          </ScrollView>
          {state.bg_timer === 1 ?
            (
              <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', }}>
                <View style={styles.PaginationNextButtonContainer}>
                  <TouchableOpacity style={styles.PaginationUpButton} activeOpacity={.5}
                    onPress={() => { this.refs._scrollView.scrollTo({ x: 0, y: 0, animated: true }); }}>
                    <Icon name="arrow-up" size={20} style={styles.icons} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.CenteredSyncButton} activeOpacity={.5}
                    onPress={() => this._synclist()}>
                    <Icon name="sync" size={20} style={styles.icons} />
                  </TouchableOpacity>

                  {
                    /*
                    <TouchableOpacity style={styles.PaginationNextButton} activeOpacity={.5}
                    onPress={() => this._nextbutton()}>
                    <Icon name="arrow-down" size={20} style={styles.icons} />
                  </TouchableOpacity>
                    */
                  }
                </View>
              </View>
            )
            :
            (<Text></Text>)
          }

        </DrawerLayoutAndroid>
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
    width: '100%'
  },
  containerResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'

  },

  container: {
    flex: 1,
    width: '100%'
  },
  animatedBox: {
    flex: 1,
    backgroundColor: "#38C8EC",
    padding: 10,
    zIndex: 5000,
  },
  cardViewStyle: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '90%',
    height: 150,
    marginBottom: 20,
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
  entreprise: {
    marginLeft: 20,
    marginBottom: 15,
  },
  entreprisename: {
    color: '#00BFA6',
    fontSize: 20,
    width: 300
  },
  country: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 20,
  },
  city: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 20,
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
  },
  OptionsButtonStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#F8DCB6',
    borderRadius: 10,
    flexDirection: 'row',
    width: 260,
    height: 10,
  },
  iconNotifs: {
    marginRight: 10,
    color: '#EB8159',
  },
  TextNotifs: {
    color: '#E3724A',
  }
});