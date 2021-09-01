import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import Dashboard from '../screens/dashboard/dashboard';
import Clients from '../screens/clients/clients';
import ShowClient from '../screens/clients/show_client';
import EditClient from '../screens/clients/edit_client';
import AddClient from '../screens/clients/add_client';
import DeleteClient from '../screens/clients/delete_client';
import SearchClient from '../screens/clients/search_client';
import SyncClient from '../screens/clients/sync_clients';
import Categories from '../screens/produits/categories';
import ShowProduits from '../screens/produits/show_produits';
import ShowAllProduits from '../screens/produits/show_Allproduits';
import SyncCategoriesProduits from '../screens/produits/sync_categories_products';
import SearchCategoriesProduits from '../screens/produits/search_categories';
import SearchProduits from '../screens/produits/search_produits';
import ShowProduitInfos from '../screens/produits/infos_produit';
import EditProduitInfos from '../screens/produits/edit_produit';
import Commandes from '../screens/commandes/commandes';
import SyncCommandes from '../screens/commandes/sync_commandes';
import ShowCommande from '../screens/commandes/show_commande';
import Panier_ from '../screens/panier/panier';
import Recap from '../screens/panier/recap';
import Validation_commande from '../screens/panier/validation_commande';
import Statistiques from '../screens/statistiques/statistiques';
import Factures from '../screens/factures/factures';
import SyncFactures from '../screens/factures/syncfactures';
import ShowFacture from '../screens/factures/ShowFacture';
import A_propos from '../screens/a_propos';
import Support from '../screens/support/support';
import SupportLogin from '../screens/support/support_login';
import Downloading_commandes from '../screens/commandes/downloading_commandes';
import DownCategoriesProduits_ from '../screens/produits/down_categories_products';
import Configuration from '../screens/configuration/configuration';


const screens = {
  Dashboard: {
    screen: Dashboard,
    navigationOptions: {
      headerShown: false,
    }
  },
  Clients: {
    screen: Clients,
    navigationOptions: {
      headerShown: false,
    }
  },
  ShowClient: {
    screen: ShowClient,
    navigationOptions: {
      headerShown: false,
    }
  },
  EditClient: {
    screen: EditClient,
    navigationOptions: {
      headerShown: false,
    }
  },
  AddClient: {
    screen: AddClient,
    navigationOptions: {
      headerShown: false,
    }
  },
  DeleteClient: {
    screen: DeleteClient,
    navigationOptions: {
      headerShown: false,
    }
  },
  SearchClient: {
    screen: SearchClient,
    navigationOptions: {
      headerShown: false,
    }
  },
  SyncClient: {
    screen: SyncClient,
    navigationOptions: {
      headerShown: false,
    }
  },
  Categories: {
    screen: Categories,
    navigationOptions: {
      headerShown: false,
    }
  },
  ShowProduits: {
    screen: ShowProduits,
    navigationOptions: {
      headerShown: false,
    }
  },
  ShowAllProduits: {
    screen: ShowAllProduits,
    navigationOptions: {
      headerShown: false,
    }
  },
  SyncCategoriesProduits: {
    screen: SyncCategoriesProduits,
    navigationOptions: {
      headerShown: false,
    }
  },
  SearchCategoriesProduits: {
    screen: SearchCategoriesProduits,
    navigationOptions: {
      headerShown: false,
    }
  },
  SearchProduits: {
    screen: SearchProduits,
    navigationOptions: {
      headerShown: false,
    }
  },
  ShowProduitInfos: {
    screen: ShowProduitInfos,
    navigationOptions: {
      headerShown: false,
    }
  },
  EditProduitInfos: {
    screen: EditProduitInfos,
    navigationOptions: {
      headerShown: false,
    }
  },
  Commandes: {
    screen: Commandes,
    navigationOptions: {
      headerShown: false,
    }
  },
  SyncCommandes: {
    screen: SyncCommandes,
    navigationOptions: {
      headerShown: false,
    }
  },
  ShowCommande: {
    screen: ShowCommande,
    navigationOptions: {
      headerShown: false,
    }
  },
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
  },
  Downloading_commandes: {
    screen: Downloading_commandes,
    navigationOptions: {
      headerShown: false,
    }
  },
  DownCategoriesProduits: {
    screen: DownCategoriesProduits_,
    navigationOptions: {
      headerShown: false,
    }
  },
  Statistiques: {
    screen: Statistiques,
    navigationOptions: {
      headerShown: false,
    }
  },
  Factures: {
    screen: Factures,
    navigationOptions: {
      headerShown: false,
    }
  },
  SyncFactures: {
    screen: SyncFactures,
    navigationOptions: {
      headerShown: false,
    }
  },
  ShowFacture: {
    screen: ShowFacture,
    navigationOptions: {
      headerShown: false,
    }
  },
  A_propos: {
    screen: A_propos,
    navigationOptions: {
      headerShown: false,
    }
  },
  Support: {
    screen: Support,
    navigationOptions: {
      headerShown: false,
    }
  },
  SupportLogin: {
    screen: SupportLogin,
    navigationOptions: {
      headerShown: false,
    }
  },
  Configuration: {
    screen: Configuration,
    navigationOptions: {
      headerShown: false,
    }
  }

}



const home_navigator = createStackNavigator(screens);
export default createAppContainer(home_navigator);








