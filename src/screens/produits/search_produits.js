import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Linking, TextInput, ImageBackground } from 'react-native';
import RNFS, { stat } from 'react-native-fs';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Search_cat_navbar from '../../navbars/produits/recherche_categories_navbar'
import CardView from 'react-native-cardview'
import { Spinner } from '../../Spinner';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import moment from 'moment';


var { width } = Dimensions.get('window');
const searchImg = require('../../res/search.png');
const notfound = require('../../res/notfound.png');
export default class SearchProduits extends React.Component {

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this._isMounted = false;
    const id_categorie = navigation.getParam('id_cat');
    this.state = {
      rechercheinput: '',
      SearchData: [],
      search_timer: 0,
      found: 0,
      declancheur: 0,
      searchframe: 0,
      label: '',
    };
    const back_rechercheinput = navigation.getParam('back_rechercheinput');
    if (back_rechercheinput) {
      this.search_produits_back(back_rechercheinput);
    }
  }

  componentDidMount() {
    let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Recherche des produits (fenetre produits)\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
    this._isMounted = true;
    var db = openDatabase({ name: 'iSalesDatabase.db' });
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
    let log_msg7 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Recherche produits : Couper la connexion avec la base de donnee \n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg7, 'utf8');
  }
  search_produits_back(back_rechercheinput) {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    this.setState({ search_timer: 1, found: 0, declancheur: 1 });
    db.transaction(tx => {
      tx.executeSql(`SELECT DISTINCT ref,label,price,price_ttc,stock_reel from produits where label LIKE '${back_rechercheinput}%' OR label LIKE '%${back_rechercheinput}' OR label LIKE '%${back_rechercheinput}%' OR label LIKE '${back_rechercheinput}' OR ref LIKE '${back_rechercheinput}%' OR ref LIKE '%${back_rechercheinput}' OR ref LIKE '%${back_rechercheinput}%' OR ref LIKE '${back_rechercheinput}'`, [], (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        this.setState({
          SearchData: temp,
          found: 1,
          search_timer: null,
          searchframe: 2,
        });
      });
    });
  }
  search_bycategories(id_categorie) {

    var db = openDatabase({ name: 'iSalesDatabase.db' });
    console.log('search by categorie' + id_categorie);
    const { rechercheinput } = this.state;
    this.setState({ search_timer: 1, found: 0, declancheur: 1 });

    let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Recherche produits : recherche categorie :" + rechercheinput + "\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');

    db.transaction(tx => {
      tx.executeSql(`SELECT DISTINCT ref,label,price,price_ttc,stock_reel from produits where (id_categorie=${id_categorie}) AND (label LIKE '${rechercheinput}%' OR label LIKE '%${rechercheinput}' OR label LIKE '%${rechercheinput}%' OR label LIKE '${rechercheinput}' OR ref LIKE '${rechercheinput}%' OR ref LIKE '%${rechercheinput}' OR ref LIKE '%${rechercheinput}%' OR ref LIKE '${rechercheinput}')`, [], (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        this.setState({
          SearchData: temp,
          found: 1,
          search_timer: null,
          searchframe: 1,
        });
      });
    });

  }
  search_Allproduits() {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    this.setState({ search_timer: 1, found: 0, declancheur: 1 });
    const { rechercheinput } = this.state;

    let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Recherche produits : recherche tous les produits - produit: " + rechercheinput + "\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');


    db.transaction(tx => {
      tx.executeSql(`SELECT DISTINCT ref,label,price,price_ttc,stock_reel from produits where label LIKE '${rechercheinput}%' OR label LIKE '%${rechercheinput}' OR label LIKE '%${rechercheinput}%' OR label LIKE '${rechercheinput}' OR ref LIKE '${rechercheinput}%' OR ref LIKE '%${rechercheinput}' OR ref LIKE '%${rechercheinput}%' OR ref LIKE '${rechercheinput}'`, [], (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        this.setState({
          SearchData: temp,
          found: 1,
          search_timer: null,
          searchframe: 2,
        });
      });
    });
  }

  search_produit_cible() {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    const { rechercheinput } = this.state;
    this.setState({ search_timer: 1, found: 0, declancheur: 1 });

    let log_msg4 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Recherche produits : recherche produit cible - produit: " + rechercheinput + "\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg4, 'utf8');


    db.transaction(tx => {
      tx.executeSql(`SELECT DISTINCT ref,label,price,price_ttc,stock_reel from produits where ref = '${rechercheinput}'`, [], (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        this.setState({
          SearchData: temp,
          found: 1,
          search_timer: null,
          searchframe: 2,
        });
      });
    });
  }

  _ShowCategorie(index) {
    this.props.navigation.navigate('ShowProduits', { id_categorie: index });
    let log_msg5 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Recherche produits : ouverture categorie :" + index + "\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg5, 'utf8');
    //alert(`This is row ${index}`);
  }

  _Showinfos(ref, rechercheinput) {
    this.props.navigation.navigate('ShowProduitInfos', { ref: ref, id_cat: null, rechercheinput: rechercheinput, searchsource: 2 });
    let log_msg6 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Recherche produits : ouverture produit ref :" + ref + " - label :" + rechercheinput + "\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg6, 'utf8');
  }

  results(state) {

    if (state.declancheur === 0) {
      return (
        <View style={styles.searching_view}>
          <Image style={styles.img} source={searchImg} />
        </View>
      );
    } else {
      if (state.search_timer === 1) {
        return (
          <View style={styles.searching_view}>
            <Image style={styles.img} source={searchImg} />
            <Text style={styles.searching_text}>Recherche en cours ...</Text>
            <Spinner />
          </View>
        );
      } else {
        if ((state.found === 1) && (state.SearchData.length > 0)) {

          if (state.searchframe === 1) {
            return (
              state.SearchData.map((rowData, index) =>
              (

                  <CardView key={index} cardElevation={10} cornerRadius={5} style={styles.cardViewStyle2}>
                    <TouchableOpacity style={styles.cardViewStyle2} onPress={() => this._Showinfos(rowData.ref, null)}>
                      <ImageBackground style={styles.circle} source={require('../../res/notfound_image.jpg')}>
                        <Image style={styles.circle} source={{ uri: 'file://' + RNFS.DocumentDirectoryPath + '/iSales_3/produits/images/' + rowData.ref + '.jpg' }} />
                      </ImageBackground>
                      <View>
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
                            (<Text style={styles.StockText_null}>Information non fournie</Text>)
                        }
                      </View>
                    </View>
                  </TouchableOpacity>
                </CardView>

              )
              )
            );
          }
          else if (state.searchframe === 2) {
            return (
              state.SearchData.map((rowData, index) => (
                <CardView key={index} cardElevation={10} cornerRadius={5} style={styles.cardViewStyle2}>
                  <TouchableOpacity style={styles.cardViewStyle2} onPress={() => this._Showinfos(rowData.ref, this.state.rechercheinput)}>
                    <ImageBackground style={styles.circle} source={require('../../res/notfound_image.jpg')}>
                      <Image style={styles.circle} source={{ uri: 'file://' + RNFS.DocumentDirectoryPath + '/iSales_3/produits/images/' + rowData.ref + '.jpg' }} />
                    </ImageBackground>
                    <View>
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
                            (<Text style={styles.StockText_null}>Information non fournie</Text>)
                        }
                      </View>
                    </View>
                  </TouchableOpacity>
                </CardView>
              ))
            );
          }

        } else if ((state.found === 1) && (state.SearchData.length === 0)) {
          return (
            <View style={styles.searching_view}>
              <Image style={styles.img} source={notfound} />
              <Text style={styles.searchnotfound_text}>Recherche non trouvée</Text>
            </View>
          );
        }
      }
    }
  }



  render() {
    const state = this.state;
    const { navigate } = this.props.navigation;
    const { navigation } = this.props;
    const id_categorie = navigation.getParam('id_cat');

    return (

      <ScrollView contentContainerStyle={styles.containerMain} >
        <Search_cat_navbar title={navigate}></Search_cat_navbar>



        <View style={styles.container}>
          <View style={styles.containerResults}>

            <View style={styles.cardViewStyle}>
              <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle1}>

                <View style={styles.SearchContainer}>
                  <TextInput style={styles.inputs} placeholder="Nom ou référence du produit"
                    ref={input => { this.rechercheinput = input }} onChangeText={(text) => this.setState({ rechercheinput: text })}></TextInput>

                  <View style={styles.SearchButtons}>

                    {
                      state.label ?
                        (
                          <TouchableOpacity style={styles.SubmitButtonStyle} activeOpacity={.5}
                            onPress={this.search_bycategories.bind(this, id_categorie)}>
                            <Icon name="search" size={10} style={styles.iconSearch} />
                            <Text style={styles.TextSearch}>{state.label}</Text>
                          </TouchableOpacity>
                        )
                        :
                        (<Text></Text>)
                    }



                    <TouchableOpacity style={styles.SubmitButtonStyle} activeOpacity={.5}
                      onPress={this.search_Allproduits.bind(this)}>
                      <Icon name="search" size={10} style={styles.iconSearch} />
                      <Text style={styles.TextSearch}>Tous les produits</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.SubmitButtonStyle} activeOpacity={.5}
                      onPress={this.search_produit_cible.bind(this)}>
                      <Icon name="filter" size={10} style={styles.iconSearch} />
                      <Text style={styles.TextSearch}>Référence Ciblée</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </CardView>
              {this.results(state)}





            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
}




const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },

  containerMain: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',

  },
  containerResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',

  },
  cardViewStyle0: {
    alignItems: 'center',
    flexDirection: 'row',
    width: width - 80,
    height: 50,
    margin: 10,
  },
  cardViewStyle: {
    //alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    //width: '100%'

  },
  cardViewStyle2: {
    alignItems: 'center',
    flexDirection: 'row',
    //width: '90%',
    height: 150,
    margin: 10,
  },
  SubmitButtonStyle: {
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 5,
    paddingTop: 5,
    backgroundColor: '#00BFA6',
    borderRadius: 25,
    //width: 150,
    //height: 50,
  },
  iconSearch: {
    color: '#ffffff',
    textAlign: 'center',
    marginRight: 10,

  },
  TextSearch: {
    color: '#ffffff',
    textAlign: 'center',
  },
  cardViewStyle1: {
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    width: width - 80,
    //width: '90%',
    marginBottom: 30,
  },
  inputs: {
    color: '#00BFA6',
    textAlign: 'left',
    borderColor: '#00BFA6',
    borderWidth: 1,
    borderRadius: 25,
    color: '#00BFA6',
    width: '90%',
    paddingLeft: 25,
  },
  SearchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    //flexDirection: 'row',
    marginTop: 20,
    marginBottom: 5,
    width: '100%',


  },
  SearchButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: width - 80,

  },

  img: {
    width: 350,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    marginTop: 50,
  },
  entreprise: {
    marginLeft: 20,
    marginBottom: 15,
  },
  entreprisename: {
    color: '#00BFA6',
    fontSize: 20,
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
  }, circle: {
    margin: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    paddingTop: 10,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flexDirection: 'row',
  },
  cardViewStyle2: {
    //flex:1,
    margin: 10,
    width: width - 80,
    flexDirection: 'row',
  },
  searching_text: {
    alignItems: 'center',
    justifyContent: 'center',
    color: '#00BFA6',
  },
  searching_view: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchnotfound_text: {
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d64541',
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
    width: '88%',
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
  productname: {
    marginLeft: 20,
    color: '#00BFA6',
    fontSize: 16,
    width: '50%',
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
  StockText: {
    fontSize: 15,
    color: '#00BFA6',
  },
  TarifText: {
    fontSize: 18,
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

});