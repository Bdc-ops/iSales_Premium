import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Panier_ from '../screens/panier/panier';
import Recap from '../screens/panier/recap';
import Validation_commande from '../screens/panier/validation_commande';

const screens = {

  Panier_: {
    screen: Panier_,
    navigationOptions: {
      headerShown: false,
    }
  },
  Recap: {
    screen: Recap,
    navigationOptions: {
      headerShown: false,
    }
  },
  Validation_commande: {
    screen: Validation_commande,
    navigationOptions: {
      headerShown: false,
    }
  }

}

const Paniernav = createStackNavigator(screens);
export default createAppContainer(Paniernav);
