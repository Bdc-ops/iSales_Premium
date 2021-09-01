import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-community/async-storage';

class Produitinfos_navbar extends React.Component {


  back() {
    //this.props.title('SearchCategoriesProduits', { back_rechercheinput: this.props.rechercheinput })
    if (this.props.subtitle && !this.props.back_rechercheinput) {
      this.props.title('ShowProduits', { id_categorie: this.props.subtitle })
    }
    if (this.props.back_rechercheinput && !this.props.subtitle) {
      if (this.props.search_src === 2) {
        this.props.title('SearchProduits', { id_cat: this.props.subtitle, back_rechercheinput: this.props.back_rechercheinput })
      } else if (this.props.search_src === 1) {
        this.props.title('SearchCategoriesProduits', { back_rechercheinput: this.props.back_rechercheinput })
      }
    }
    if (!this.props.back_rechercheinput && !this.props.subtitle) {
      this.props.title('ShowAllProduits')
    }
  }

  panier() {
    this.props.title('Panier_');
  }
  render() {

    return (




      <View>
        <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#00BFA6', '#0CD1AF', '#0CD1AF', '#29FCC4']} style={styles.container}>


          <TouchableOpacity style={styles.SubmitButtonStyleHome} activeOpacity={.5}
            onPress={() => { this.back() }}>
            <Icon name="arrow-left" size={20} style={styles.iconHome} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.SubmitButtonStylePanier} activeOpacity={.5}
            onPress={() => { this.panier() }}>
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
  iconPanier: {
    color: '#00BFA6',
    alignItems: 'flex-end'
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
    right: 60
  },

});

export default Produitinfos_navbar;