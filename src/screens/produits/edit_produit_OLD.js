import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Linking, TextInput, TouchableHighlight, ImageBackground } from 'react-native';
import RNFS from 'react-native-fs';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNBackgroundDownloader from 'react-native-background-downloader';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Produit_infos_navbar from '../../navbars/produits/produiteditinfos_navbar'
import CardView from 'react-native-cardview'
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'iSalesDatabase.db' });
import Toast from 'react-native-toast-native';
var { width } = Dimensions.get('window');
const img_not_found = require('../../res/notfound_image.jpg');
import moment from 'moment';

export default class EditProduitInfos extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ProduitData: [],
      qt: 0,
      pressed1: false,
      pressed2: false,
      pressed3: false,
      type: 0,
      pvu:'',
      pvu_old:'',
      pv:'',
      remise:'',
      type_commande:'',
      back:'',
    };
  }

  _getProduitData(ref) {
    let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Edit produit ref : "+ref+"\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    db.transaction(tx => {
      tx.executeSql(`SELECT * FROM produits where ref='${ref}' limit 1`, [], (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        this.setState({
          ProduitData: temp,
        });
      });
    });
  }
  componentDidMount() {

    var db = openDatabase({ name: 'iSalesDatabase.db' });
    const { navigation } = this.props;
    const ref = navigation.getParam('ref');
    const qte = navigation.getParam('qte');
    const pv = navigation.getParam('pv');
    const type_commande = navigation.getParam('type_commande');
    const remise = navigation.getParam('remise');
    const pvu = navigation.getParam('pvu');

    console.log('====> '+ref+' - '+qte+' - '+pv+' - '+type_commande+' - '+remise+' - '+pvu);

    if((ref) && (qte) && (type_commande)){
      this.setState({qt:qte,pv:pv,remise: remise,back:1,pvu:pvu,pvu_old:pvu});
      if(type_commande === 'u'){this.setState({pressed1: true,pressed2: false,pressed3: false,type_commande:type_commande,type:1});
      }else if(type_commande==='c'){this.setState({pressed1: false,pressed2: true,pressed3: false,type_commande:type_commande,type:1});
      }else if(type_commande==='p'){this.setState({pressed1: false,pressed2: false,pressed3: true,type_commande:type_commande,type:1});}
    }
    
    this._getProduitData(ref);
    let log_msg1 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Edit produit (ref :"+ref+" ,qty:"+qte+" ,price ht:"+pv+" ,type:"+type_commande+" ,remise:"+remise+" ,pvu:"+pvu+")\n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg1, 'utf8');
  }

  componentWillMount() {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
}
componentWillUnmount() {
    this._isMounted = false;
    this.closeDB(db);
}

closeDB(db) {
    db.close(function () {
        console.log('database is closed ok');
    });
    let log_msg7 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Edit Produit : Couper la connexion avec la base de donnee \n-------";
    RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg7, 'utf8');
}

  _inc(qt) {
    this.setState({ qt: parseInt(qt) + 1 });
  }
  _dec(qt) {
    if (qt > 0) {
      this.setState({ qt: parseInt(qt) - 1 });
    }
  }

  async _editpanier(label, ref, tva,remise) {
    var db = openDatabase({ name: 'iSalesDatabase.db' });
    this.state.remise ? '0' : this.state.remise;
    await this.state.ProduitData.map(async (rowData) => {


      if((this.state.pv === '') && (this.state.pvu != '')){
        if(this.state.pressed1){
          this.setState({ pv: rowData.price});
          console.log('here 1')
        }else if(this.state.pressed2){
          this.setState({ pv: (rowData.colis_qty*this.state.pvu)});
          console.log('here 2'+(rowData.colis_qty*this.state.pvu));
        }else if(this.state.pressed3){
          this.setState({ pv: (rowData.palette_qty*(rowData.colis_qty*this.state.pvu))});
          console.log('here 3')
        }
        console.log('-------------- 1');
        console.log('pvu : '+this.state.pvu +' - pv: '+this.state.pv);
      }else if((this.state.pvu === '') && (this.state.pv != '')){
        if(this.state.pressed1){
          this.setState({pvu: rowData.price});
        }else if(this.state.pressed2){
          this.setState({pvu: rowData.price});
        }else if(this.state.pressed3){
          this.setState({pvu: rowData.price});
        }
        console.log('-------------- 2');
        console.log('pvu : '+this.state.pvu +' - pv: '+this.state.pv);
      }
      else if((this.state.pvu != '') && (this.state.pv != '')){
        if(this.state.pressed1){
        this.setState({pv:this.state.pvu,pvu: this.state.pvu})
        }else if(this.state.pressed2){
        this.setState({pv:this.state.pvu*rowData.colis_qty,pvu: this.state.pvu})
        }else if(this.state.pressed3){
        this.setState({pv:(rowData.palette_qty*this.state.pvu*rowData.colis_qty),pvu: this.state.pvu})
        }
        console.log('-------------- 3');
        console.log('pvu : '+this.state.pvu +' - pv: '+this.state.pv+' - pvu : '+rowData.price);

        // change here
      }
      
      else if ((this.state.pv === '') &&(this.state.pvu === '')){
        if(this.state.pressed1){
          this.setState({ pv: rowData.price,pvu: rowData.price});
        }else if(this.state.pressed2){
          this.setState({ pv: (rowData.colis_qty*rowData.price),pvu: rowData.price});
        }else if(this.state.pressed3){
          this.setState({ pv: (rowData.palette_qty*(rowData.colis_qty*rowData.price)),pvu: rowData.price});
        }
        console.log('-------------- 1');
        console.log('pvu : '+this.state.pvu +' - pv: '+this.state.pv);
      }
      /*if((this.state.pv === '') && (this.state.pvu === '')){
        if(this.state.pressed1){
          this.setState({ pv: rowData.price, pvu: rowData.price, });
        }else if(this.state.pressed2){
          this.setState({ pv: (rowData.colis_qty*rowData.price), pvu: rowData.price, });
        }else if(this.state.pressed3){
          this.setState({ pv: (rowData.palette_qty*(rowData.colis_qty*rowData.price)), pvu: rowData.price});
        }
      }else if(this.state.pvu != ''){
        if(this.state.pressed1){
        this.setState({pv:this.state.pvu,pvu: this.state.pvu})
        }else if(this.state.pressed2){
        this.setState({pv:this.state.pvu*rowData.colis_qty,pvu: this.state.pvu})
        }else if(this.state.pressed3){
        this.setState({pv:(rowData.palette_qty*this.state.pvu*rowData.colis_qty),pvu: this.state.pvu})
        }
      }else{
        this.setState({
          pv:this.state.pv,
          pvu:this.state.pvu,
        })
      }*/

    });

    console.log(this.state.pvu +'  -  '+this.state.pv)
    //alert(label+'-'+ref+'-'+qt+'-'+(price*qt)+'-'+(qt*(price*tva))+'-'+tva+'-'+type_commande,remise);
    const errortoast = {
      backgroundColor: "#d64541",
      color: "#ffffff",
      fontSize: 15,
      borderRadius: 50,
      fontWeight: "bold",
      yOffset: 200
    };
    const successtoast = {
      backgroundColor: "#00BFA6",
      color: "#ffffff",
      fontSize: 15,
      borderRadius: 50,
      fontWeight: "bold",
      yOffset: 200
    };
/*
INSERT INTO memos(id,text) 
SELECT 5, 'text to insert' 
WHERE NOT EXISTS(SELECT 1 FROM memos WHERE id = 5 AND text = 'text to insert');
*/
    if ((this.state.qt > 0) && (this.state.type === 1)) {
      db.transaction(tx => {
        //tx.executeSql(`SELECT * FROM panier where ref='${ref}' and type_commande='${this.state.type_commande}'`, [], (tx, results) => {
          tx.executeSql(`SELECT * FROM panier where ref='${ref}'`, [], (tx, results) => {

              if(results.rows.item(0).type_commande === this.state.type_commande){

                  tx.executeSql(
                    `UPDATE panier set qt=?,price=?,price_ttc=?,remise=?,pvu=? where id=${results.rows.item(0).id}`,
                    //[(parseInt(this.state.qt)), parseFloat((this.state.pv*this.state.qt)), parseFloat((this.state.pv*this.state.qt)*((parseInt(tva)/100)+1)),this.state.remise
                      [(parseInt(this.state.qt)), parseFloat(this.state.pv), parseFloat(this.state.pv)+(((tva / 1) * (this.state.pv) / 100)),this.state.remise,this.state.pvu],
                    (tx, results) => {
                      console.log('Results', results.rowsAffected +' - Le produit a bien été modifié dans le panier.');
                      if (results.rowsAffected > 0) {
                        Toast.show('Produit modifé dans le panier', Toast.LONG, Toast.TOP, successtoast);
                        let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Edit Produit :  valider la modification dans le panier : (ref:"+ref+", Qty:"+this.state.qt+", Prix_ht:"+parseFloat(this.state.pv)+", prix_ttc:"+parseFloat(this.state.pv)+(((tva / 1) * (this.state.pv) / 100))+", remise:"+this.state.remise+", pvu:"+this.state.pvu+"\n-------";
                        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');

                      }else{
                        Toast.show('Erreur lors de la modification du produit dans le panier', Toast.LONG, Toast.TOP, errortoast);
                        let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Edit Produit :  valider la modification dans le panier : ERROR UPDATE PRODUCT INTO PANIER ";
                        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
                      }
                    }
                  );
                
                
              }else{
                Toast.show('le produit existe déjà dans le panier', Toast.LONG, Toast.TOP, errortoast);
                let log_msg2 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Edit Produit :  le produit existe déjà dans le panier";
                        RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg2, 'utf8');
              }
          });
        
        });
      
    } else if ((this.state.qt <= 0) && (this.state.type === 1)) {
      Toast.show('Veuillez saisir la quantité', Toast.LONG, Toast.TOP, errortoast);
      let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Edit Produit :  Veuillez saisir la quantité";
      RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
    } else if ((this.state.type === 0) && (this.state.qt > 0)) {
      Toast.show('Veuillez choisir le colisage', Toast.LONG, Toast.TOP, errortoast);
      let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Edit Produit :  Veuillez choisir le colisage";
      RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
    } else {
      Toast.show('Veuillez indiquer la quantité', Toast.LONG, Toast.TOP, errortoast);
      let log_msg3 = "\n" + moment().format('YYYY-MM-DD hh:mm:ss a') + " : Edit Produit :  Veuillez indiquer la quantité'";
      RNFS.appendFile(RNFS.ExternalStorageDirectoryPath + '/iSales_Premium/Backups/logs/logs.txt', log_msg3, 'utf8');
    }

  }
  _loadimage(ref) {
    RNFS.exists(RNFS.DocumentDirectoryPath + '/iSales_3/produits/images/' + ref + '.jpg')
      .then(success => {
        if (success) {
          return <Image style={styles.circle} source={{ uri: 'file://' + RNFS.DocumentDirectoryPath + '/iSales_3/produits/images/' + ref + '.jpg' }} />
        } else {
          return <Image style={styles.circle} source={img_not_found} />
        }
      })
  }
  render() {
    const state = this.state;
    const { navigate } = this.props.navigation;

    return (

      <ScrollView contentContainerStyle={styles.containerMain} >
        <Produit_infos_navbar title={navigate}></Produit_infos_navbar>



        <View style={styles.container}>
          <View style={styles.containerResults}>
            <View style={styles.cardViewStyle}>

              {state.ProduitData.map((rowData, index) => (
                 
                <View key={index} style={styles.cardViewStyle1}>


                  <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle0}>

                    <View style={styles.cardViewStyle2}>
                      <View style={styles.imgcontainer}>
                        <ImageBackground style={styles.circle1} source={require('../../res/notfound_image.jpg')}>
                          <Image style={styles.circle} source={{ uri: 'file://' + RNFS.DocumentDirectoryPath + '/iSales_3/produits/images/' + rowData.ref + '.jpg' }} />
                        </ImageBackground>
                      </View>

                      <View style={styles.datacontainer}>
                        <Text style={styles.productname}>{rowData.label}</Text>
                        <Text style={styles.productref}>Référence : {rowData.ref}</Text>
                        <Text>{rowData.description}</Text>
                        <View style={styles.productinfos_stock}>
                          <Icon name="boxes" size={13} style={styles.iconDetails} />
                          {
                            rowData.stock_reel ?
                              (<Text style={styles.StockText}>{rowData.stock_reel} en stock</Text>)
                              :
                              (<Text style={styles.StockText_null}>Stock non fourni</Text>)
                          }
                        </View>
                      </View>
                    </View>
                  </CardView>

                  <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle3}>
                  <View style={{flexDirection:'row'}}>

                    <View style={styles.pricecontainer}>
                      <View underlayColor={'#00BFA6'} onPress={() => { }} style={[styles.prices, this.state.pressed1 ? { borderColor: '#00BFA6', borderWidth: 2, borderRadius: 10, backgroundColor: '#0CD1AF' } : {}]}>
                        <View style={styles.pressed}>
                          <Text>Unité</Text>
                          <Text>{(parseFloat(rowData.price)).toFixed(2)} € HT</Text>
                          <Text>{(parseFloat(rowData.price_ttc)).toFixed(2)} € TTC</Text>
                        </View>
                      </View>

                      <View underlayColor={'#00BFA6'} onPress={() => { }} style={[styles.prices, this.state.pressed2 ? { borderColor: '#00BFA6', borderWidth: 2, borderRadius: 10, backgroundColor: '#0CD1AF' } : {}]}>
                        <View style={styles.pressed}>
                          <Text>Colis</Text>
                          <Text>{rowData.colis_qty >0 ? parseFloat(rowData.colis_qty*(state.pvu?state.pvu:state.pvu_old)).toFixed(2) : 0} € HT</Text>
                          <Text>{rowData.colis_qty >0 ? parseFloat((rowData.colis_qty*(state.pvu?state.pvu:state.pvu_old)) + (((rowData.tva_tx / 1) * rowData.colis_qty*(state.pvu?state.pvu:state.pvu_old)) / 100)).toFixed(2) : 0} € TTC</Text>
                        </View>

                        
                      </View>

                      <View underlayColor={'#00BFA6'} onPress={() => { }} style={[styles.prices, this.state.pressed3 ? { borderColor: '#00BFA6', borderWidth: 2, borderRadius: 10, backgroundColor: '#0CD1AF' } : {}]}>
                        <View style={styles.pressed}>
                          <Text>Palette</Text>
                          <Text>{rowData.palette_qty >0 ? (parseFloat(rowData.palette_qty*(rowData.colis_qty*rowData.price))).toFixed(2) : 0} € HT</Text>
                          <Text>{rowData.palette_qty >0 ? ((rowData.palette_qty*(rowData.colis_qty*rowData.price)) + (((rowData.tva_tx / 1) * (rowData.palette_qty*(rowData.colis_qty*rowData.price))) / 100)).toFixed(2) : 0} € TTC</Text>
                        </View>
                      </View>
                    </View>


                    <View style={styles.paniercontainer}>
                      <Text style={styles.texts_prices}>Prix de vente unitaire</Text>
                      <View style={styles.views_price}>
                        <TextInput ref={input => { this.pvu = input }} placeholder="0.00" style={styles.inputs_price} returnKeyLabel={"next"}
                          onChangeText={(text) => this.setState({ pvu: text })} autoCapitalize='none' keyboardType='numeric'>{(parseFloat(this.state.pvu_old)).toFixed(2)}</TextInput>
                        <Text>€ HT</Text>
                      </View>
                      <Text style={styles.texts_prices}>Prix de vente</Text>
                      
                        {
                          this.state.pressed1 ?
                          (
                            <View style={styles.views_price}>
                              <TextInput ref={input => { this.pv = input }} placeholder="0.00" style={styles.inputs_price} returnKeyLabel={"next"} editable={false} selectTextOnFocus={false}
                                onChangeText={(text) => this.setState({ pv: text })} autoCapitalize='none' keyboardType='numeric'>{this.state.pv ? (parseFloat(this.state.pvu?this.state.pvu:this.state.pvu_old)).toFixed(2) : (parseFloat(rowData.price)).toFixed(2)}</TextInput>
                              <Text>€ HT  / Unité</Text>
                          </View>
                          )
                          :
                          this.state.pressed2 ?
                          (

                            <View style={styles.views_price}>
                              <TextInput ref={input => { this.pv = input }} placeholder="0.00" style={styles.inputs_price} returnKeyLabel={"next"} editable={false} selectTextOnFocus={false}
                                onChangeText={(text) => this.setState({ pv: text })} autoCapitalize='none' keyboardType='numeric'>{parseFloat(rowData.colis_qty*(this.state.pvu?this.state.pvu:this.state.pvu_old)).toFixed(2)}</TextInput>
                              <Text>€ HT  / Colis</Text>
                          </View>
                          )
                          :
                          this.state.pressed3 ?
                          (
                            <View style={styles.views_price}>
                              <TextInput ref={input => { this.pv = input }} placeholder="0.00" style={styles.inputs_price} returnKeyLabel={"next"} editable={false} selectTextOnFocus={false}
                                onChangeText={(text) => this.setState({ pv: text })} autoCapitalize='none' keyboardType='numeric'>{parseFloat(rowData.palette_qty*(rowData.colis_qty*(this.state.pvu?this.state.pvu:this.state.pvu_old))).toFixed(2)}</TextInput>
                              <Text>€ HT  / Palette</Text>
                          </View>
                          )
                          :
                          (
                            <View style={styles.views_price}>
                              <TextInput ref={input => { this.pv = input }} placeholder="0.00" style={styles.inputs_price} returnKeyLabel={"next"} editable={false} selectTextOnFocus={false}
                                onChangeText={(text) => this.setState({ pv: text })} autoCapitalize='none' keyboardType='numeric'>{this.state.pv ? (parseFloat(this.state.pv)).toFixed(2) : ''}</TextInput>
                              <Text>€ HT  / ---</Text>
                          </View>
                          )
                        }
                        
                        
                      
                      <Text style={styles.texts_prices}>Remise en pourcentage</Text>
                      <View style={styles.views_price}>
                        <TextInput ref={input => { this.remise = input }} placeholder="00.00" style={styles.inputs_price} returnKeyLabel={"next"}
                          onChangeText={(text) => this.setState({ remise: text })} autoCapitalize='none'  keyboardType='numeric'>{this.state.remise ? this.state.remise : ''}</TextInput>
                        <Text>%</Text>
                      </View>

                      {
                          this.state.pressed1 ?
                          (<Text style={styles.texts_prices}>Quantité par Unité</Text>)
                          :
                          this.state.pressed2 ?
                          (<Text style={styles.texts_prices}>Quantité par Colis</Text>)
                          :
                          this.state.pressed3 ?
                          (<Text style={styles.texts_prices}>Quantité par Palette</Text>)
                          :
                          (<Text>Quantité par ---</Text>)
                        }
                      <View style={styles.panierbuttons}>
                        <TouchableOpacity style={styles.SubmitButtonStylePrices} activeOpacity={.5}
                          onPress={() => this._dec(state.qt)}>
                          <Text style={styles.iconPrices}>-</Text>
                        </TouchableOpacity>

                        <TextInput ref={input => { this.qt = input }} style={styles.inputs} returnKeyLabel={"next"}
                          onChangeText={(text) => this.setState({ qt: text })} autoCapitalize='none' keyboardType='numeric' maxLength={10}>
                          {state.qt}
                        </TextInput>

                        <TouchableOpacity style={styles.SubmitButtonStylePrices} activeOpacity={.5}
                          onPress={() => this._inc(state.qt)}>
                          <Text style={styles.iconPrices}>+</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.SubmitButtonStylePanier} activeOpacity={.5}
                          onPress={() => this._editpanier(rowData.label,rowData.ref,rowData.tva_tx,rowData.remise)}>
                          <Text style={styles.iconPanier}>Modifier le produit</Text>
                        </TouchableOpacity>
                      </View>
                      </View>

                    </View>


                    
                    <View>
<CardView style={styles.finale_prices}>

{
                          this.state.pressed1 ?
                          (
                            <View>
                              <Text>Total HT : {((parseFloat(state.pvu?state.pvu:rowData.price))*state.qt).toFixed(2)} € (Unité)</Text>
                              <Text>Total TTC : {(((parseFloat(state.pvu?state.pvu:rowData.price))+(parseFloat(state.pvu?state.pvu:rowData.price)*(parseFloat(rowData.tva_tx)/100)))*state.qt).toFixed(2)} € (Unité)</Text>

                          </View>
                          )
                          :
                          this.state.pressed2 ?
                          (
                          <View>
                            <Text>Total HT : {rowData.colis_qty >0 ? (parseFloat(state.pv?state.pv:rowData.colis_qty*(state.pvu?state.pvu:rowData.price))*state.qt).toFixed(2) : 0} € (Colis)</Text>
                            <Text>Total TTC : {rowData.colis_qty >0 ? ((parseFloat(state.pv?state.pv:rowData.colis_qty*(state.pvu?state.pvu:rowData.price)) + ((parseFloat(state.pv?state.pv:rowData.colis_qty*(state.pvu?state.pvu:rowData.price)))*(parseFloat(rowData.tva_tx)/100)))*state.qt).toFixed(2) : 0} € (Colis)</Text>
                          </View>
                          )
                          :
                          this.state.pressed3 ?
                          (
                            <View>
                               <Text>Total HT : {rowData.palette_qty >0 ? ((parseFloat(state.pv?state.pv:rowData.palette_qty*(rowData.colis_qty*(state.pvu?state.pvu:rowData.price))))*state.qt).toFixed(2) : 0} € (Palette)</Text>
                          <Text>Total TTC : {rowData.palette_qty >0 ? (((parseFloat(state.pv?state.pv:rowData.palette_qty*(rowData.colis_qty*(state.pvu?state.pvu:rowData.price)))) + ((parseFloat(state.pv?state.pv:rowData.palette_qty*(rowData.colis_qty*(state.pvu?state.pvu:rowData.price))))*((parseFloat(rowData.tva_tx)/100))))*state.qt).toFixed(2) : 0} € (Palette)</Text>
                        
                          </View>
                          )
                          :
                          (
                            <View>
                              
                              <Text>Total HT : ---</Text>
                              <Text>Total TTC : ---</Text>
                          </View>
                          )
                        }

                          <View style={{marginTop:20}}>
                              <Text  style={{fontSize:10,color:'#d64541'}}>sans remise *</Text>
                          </View>

  </CardView>
</View>
                  </CardView>
                  <CardView cardElevation={10} cornerRadius={5} style={styles.cardViewStyle4}>
                    <Text>Notes</Text>
                    {
                      rowData.note_public ?
                        (<Text>{rowData.note_public}</Text>)
                        :
                        (<Text style={styles.StockText_null}>Aucune note n'est fournie</Text>)
                    }
                  </CardView>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
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
  finale_prices:{
    justifyContent: 'center',
    alignItems: 'center',
    margin:20,
    backgroundColor:'#e9e9e9',
    padding:20,
  },
  cardViewStyle: {
    //alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    //justifyContent: 'center',
    //width: '90%'
  },
  cardViewStyle0: {
    height: 250,
    marginBottom: 20,

  },
  cardViewStyle3: {
    height: 530,
    //flexDirection: 'row',
    //padding: 20,
  },
  cardViewStyle4: {
    //height: 100,
    padding: 20,
    marginTop: 20,
    //flexDirection: 'row',
    //width: width - 100,
  },
  cardViewStyle1: {
    flex: 1,
    //justifyContent: 'center',
    margin: 20,
    //flexDirection: 'row',
    width: width - 100,
  },
  cardViewStyle2: {
    flex: 1,
    //justifyContent: 'center',
    padding: 20,
    flexDirection: 'row',
    paddingTop: 20,
  },
  titles: {
    marginTop: 25,
    color: '#00BFA6',
    fontSize: 20,
  },
  Headericons_circle: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 15,
    backgroundColor: '#00BFA6',
    borderRadius: 50,
    width: 40,
    height: 40,
    marginLeft: 10,
  },
  Headericons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

  },
  icons: {
    color: '#ffffff',
    alignItems: 'flex-end'
  },
  circle1: {
    backgroundColor: '#ffffff',
    margin: 20,
    width: 200,
    height: 200,
    borderRadius: 100 / 2,
    paddingTop: 10,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    margin: 20,
    width: 200,
    height: 200,
    borderRadius: 100 / 2,
    paddingTop: 10,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgcontainer: {

    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
  },
  datacontainer: {
    padding: 20,
    width: '60%',
  },
  productname: {
    color: '#00BFA6',
    fontSize: 20,
  },
  productinfos_stock: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  iconDetails: {
    marginRight: 10,
    color: '#00BFA6',
  },
  StockText: {
    fontSize: 15,
    color: '#00BFA6',
  },
  StockText_null: {
    fontSize: 15,
    color: '#d64541',
  },
  pricecontainer: {
    //flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    width: '40%',
  },
  prices: {
    marginBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    width: '100%',
  },
  pressed: {
    //padding: 10,
    margin: 10,
  },
  paniercontainer: {
    //flexDirection: 'row',
    //alignItems: 'center',
    //justifyContent: 'center',
    width: '60%',
    padding:10
  },
  panierbuttons: {
    flexDirection: 'row',
    alignItems: 'center',
    //justifyContent: 'center',
    width: '100%',
    //margin: 20,
  },
  views_price: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,

  },
  inputs: {
    height: 40,
    width: 60,
    borderColor: '#00BFA6',
    borderWidth: 1,
    borderRadius: 25,
    color: '#00BFA6',
    //marginBottom: 5,
    alignItems: 'center',
    textAlign: 'center',
    marginRight: 10

  },
  inputs_price: {
    height: 40,
    width: '65%',
    borderColor: '#00BFA6',
    borderWidth: 1,
    borderRadius: 25,
    color: '#00BFA6',
    marginRight: 5,
    paddingLeft: 20,
  },
  SubmitButtonStylePrices: {
    backgroundColor: '#00BFA6',
    borderRadius: 50,
    width: 30,
    height: 30,
    marginRight: 10,
    //marginLeft: 10,
  },
  iconPrices: {
    fontSize: 20,
    color: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  SubmitButtonStylePanier: {
    backgroundColor: '#0CD1AF',
    borderRadius: 25,
    //width: 30,
    height: 30,
    
    padding: 5,
  },
  iconPanier: {
    fontSize: 15,
    color: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    paddingLeft: 8,
    paddingRight: 8,
  },
  productref: {
    marginBottom: 10,
    fontSize: 12,
  },
  texts_prices:{
    fontSize:12,
    marginTop:10,
  },

});