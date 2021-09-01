import React from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-community/async-storage';

class Categories_navbar extends React.Component {

  sync_prod_imgs() {
    this.props.title('DownCategoriesProduits');
  }
  sync_cat_prod() {
    Alert.alert(
      "IMPORTANT",
      "La synchronisation des categories et leurs produits engendrera une suppression de votre base de données produits locale pour télécharger une nouvelle",
      [
        { text: "Je confirme", onPress: () => this.props.title('SyncCategoriesProduits') },
        { text: "Annuler" }
      ],
      { cancelable: true }
    );
    //this.props.title('DownCategoriesProduits');
    //this.props.title('DownloadingImages_produits');
  }
  search_cat() {
    this.props.title('SearchCategoriesProduits');
  }
  go_panier() {
    this.props.title('Panier_');
  }
  back() {
    this.props.title('Dashboard');
  }
  render() {
    return (




      <View>
        <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#00BFA6', '#0CD1AF', '#0CD1AF', '#29FCC4']} style={styles.container}>

          {/*<View style={styles.containerTop}></View> */}


          <TouchableOpacity style={styles.SubmitButtonStyleHome} activeOpacity={.5}
            onPress={() => { this.back() }}>
            <Icon name="arrow-left" size={20} style={styles.iconHome} />
          </TouchableOpacity>



          <TouchableOpacity style={styles.SubmitButtonStyleSync0} activeOpacity={.5}
            onPress={() => { this.sync_prod_imgs() }}>
            <Icon name="images" size={20} style={styles.icons} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.SubmitButtonStyleSync} activeOpacity={.5}
            onPress={() => { this.sync_cat_prod() }}>
            <Icon name="cloud-upload-alt" size={20} style={styles.icons} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.SubmitButtonStyleSearch} activeOpacity={.5}
            onPress={() => { this.search_cat() }}>
            <Icon name="search" size={20} style={styles.icons} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.SubmitButtonStylePanier} activeOpacity={.5}
            onPress={() => { this.go_panier() }}>
            <Icon name="shopping-cart" size={20} style={styles.iconPanier} />
          </TouchableOpacity>
        </LinearGradient>
        <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#00BFA6', '#0CD1AF', '#0CD1AF', '#29FCC4']} style={styles.containerBottomBackground}></LinearGradient>
        <View style={styles.containerBottom}></View>


      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    //alignSelf: 'stretch',
    //marginLeft: 40,
    //borderBottomLeftRadius: 25,
    height: 60,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // space-between, space-around
    paddingLeft: 30,
    paddingRight: 30,
    //borderBottomLeftRadius: 100,
    //borderBottomRightRadius:100,

  },

  containerBottom: {
    backgroundColor: '#ffffff',
    height: 40,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    marginTop: -40,
    zIndex: 5,
  },
  containerBottomBackground: {
    height: 40,

  },
  SubmitButtonStyleHome: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    width: 40,
    height: 40,
    position: 'absolute',
    left: 10
  },
  SubmitButtonStyleBack: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    width: 40,
    height: 40,
    position: 'absolute',
    left: 60
  },
  SubmitButtonStylePanier: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    width: 40,
    height: 40,
    position: 'absolute',
    right: 10
  },
  SubmitButtonStyleSearch: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    width: 40,
    height: 40,
    position: 'absolute',
    right: 60
  },
  icons: {
    color: '#00BFA6',
    alignItems: 'flex-end'
  },
  iconHome: {
    color: '#CED4DA',
    alignItems: 'flex-end'
  },
  SubmitButtonStyleSync: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    width: 40,
    height: 40,
    position: 'absolute',
    right: 110
  },
  SubmitButtonStyleSync0: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    width: 40,
    height: 40,
    position: 'absolute',
    right: 160
  },
  iconPanier: {
    color: '#00BFA6',
    alignItems: 'flex-end'
  },
});

export default Categories_navbar;