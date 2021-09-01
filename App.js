import React from 'react';
import { createAppContainer, createSwitchNavigator, } from 'react-navigation';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from 'react-navigation-stack';


import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import reducers from './src/reducers'
import ReduxThunk from 'redux-thunk';

import Splash_navigator from './src/routes/splash_navigator';
import Auth_navigator from './src/routes/auth_navigator';

import Home_navigator from './src/routes/home_navigator';
import ClientsDataDownloading_navigator from './src/routes/clientsdataDownloading_navigator';
import CategoriesDataDownloading_navigator from './src/routes/categoriesdataDownloading_navigator';
import ProduitsDataDownloading_navigator from './src/routes/produitsdataDownloading_navigator';
import ProduitsImagesDownloading_navigator from './src/routes/produitsImagesDownloading_navigator';
import DownloadingData_commandes from './src/routes/commandesdataDownloading_navigator'


import Drawer_nav from './src/routes/drawer_nav';

import Dashboard from './src/screens/dashboard/dashboard';
import Clients from './src/screens/clients/clients';
import ShowClient from './src/screens/clients/show_client';
import EditClient from './src/screens/clients/edit_client';
import AddClient from './src/screens/clients/add_client';
import DeleteClient from './src/screens/clients/delete_client';
import SearchClient from './src/screens/clients/search_client';
import SyncClient from './src/screens/clients/sync_clients';
import Categories from './src/screens/produits/categories';
import ShowProduits from './src/screens/produits/show_produits';
import ShowAllProduits from './src/screens/produits/show_Allproduits';
import SyncCategoriesProduits from './src/screens/produits/sync_categories_products';
import SearchCategoriesProduits from './src/screens/produits/search_categories';
import SearchProduits from './src/screens/produits/search_produits';
import ShowProduitInfos from './src/screens/produits/infos_produit';
import EditProduitInfos from './src/screens/produits/edit_produit';
import Commandes from './src/screens/commandes/commandes';
import SyncCommandes from './src/screens/commandes/sync_commandes';
import ShowCommande from './src/screens/commandes/show_commande';
import Panier_ from './src/screens/panier/panier';
import Recap from './src/screens/panier/recap';
import Validation_commande from './src/screens/panier/validation_commande';
import A_propos from './src/screens/a_propos';
//import Downloading_commandes1 from './src/screens/commandes/downloading_commandes';
/*
import DownloadingData_categories from './src/screens/data/downloading_data_categories';
import DownloadingData_clients from './src/screens/data/downloading_data_clients';
import DownloadingData_commandes from './src/screens/data/downloading_data_commandes';
import DownloadingData_produits from './src/screens/data/downloading_data_produits';
import DownloadingImages_produits from './src/screens/data/downloading_images_produits';
import Login from './src/screens/Login';
*/

export default class App extends React.Component {
  render() {

    /*
        const Drawer = createDrawerNavigator();
        function Home_navigator() {
          return (
            <NavigationContainer >
              <Drawer.Navigator initialRouteName="Dashboard">
                <Drawer.Screen name="Dashboard" component={Dashboard} />
                <Drawer.Screen name="Clients" component={Clients} />
                <Drawer.Screen name="Categories" component={Categories} />
                <Drawer.Screen name="Commandes" component={Commandes} />
                <Drawer.Screen name="Panier_" component={Panier_} />
                <Drawer.Screen name="A_propos" component={A_propos} />
                <Drawer.Screen name="ShowClient" component={ShowClient} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="EditClient" component={EditClient} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="AddClient" component={AddClient} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="DeleteClient" component={DeleteClient} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="SearchClient" component={SearchClient} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="SyncClient" component={SyncClient} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="ShowProduits" component={ShowProduits} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="ShowAllProduits" component={ShowAllProduits} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="SyncCategoriesProduits" component={SyncCategoriesProduits} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="SearchCategoriesProduits" component={SearchCategoriesProduits} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="SearchProduits" component={SearchProduits} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="ShowProduitInfos" component={ShowProduitInfos} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="EditProduitInfos" component={EditProduitInfos} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="SyncCommandes" component={SyncCommandes} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="ShowCommande" component={ShowCommande} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="Recap" component={Recap} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="Validation_commande" component={Validation_commande} options={{ drawerLabel: () => null }} />
    
                <Drawer.Screen name="DownloadingData_clients" component={DownloadingData_clients} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="DownloadingData_categories" component={DownloadingData_categories} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="DownloadingData_commandes" component={DownloadingData_commandes} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="DownloadingData_produits" component={DownloadingData_produits} options={{ drawerLabel: () => null }} />
                <Drawer.Screen name="DownloadingImages_produits" component={DownloadingImages_produits} options={{ drawerLabel: () => null }} />
    
              </Drawer.Navigator>
            </NavigationContainer>
    
    
          );
        }
    */


    const Navigation = createAppContainer(createSwitchNavigator(
      {
        AuthLoading: Splash_navigator,
        Auth: Auth_navigator,
        Dashboard: Home_navigator,
        ClientsDataDownloading_navigator: ClientsDataDownloading_navigator,
        CategoriesDataDownloading_navigator: CategoriesDataDownloading_navigator,
        ProduitsDataDownloading_navigator: ProduitsDataDownloading_navigator,
        ProduitsImagesDownloading_navigator: ProduitsImagesDownloading_navigator,
        DownloadingData_commandes: DownloadingData_commandes,
        //Paniernav: Panier_navigator,

      },
      {
        initialRouteName: 'AuthLoading',
      }
    ));



    return (
      <Provider store={createStore(reducers, {}, applyMiddleware(ReduxThunk))}>
        <Navigation />
      </Provider>
    );
  }

}

/* if(this.state.token===null){
return (
<Provider store={createStore(reducers,{}, applyMiddleware(ReduxThunk))}>
<NavigationContainer>
<Auth_navigator screenOptions={{headerShown: false}}/>
</NavigationContainer>
</Provider>
)
}else{
return (
<Provider store={createStore(reducers,{}, applyMiddleware(ReduxThunk))}>
<NavigationContainer>
<Begin_navigator screenOptions={{headerShown: false}}/>
</NavigationContainer>
</Provider>
)
}*/


