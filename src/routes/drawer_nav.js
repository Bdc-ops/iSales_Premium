import * as React from 'react';
import { Button, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

const Drawer = createDrawerNavigator();

export default function home_navigator() {
    return (
        <NavigationContainer>
            <Drawer.Navigator initialRouteName="Dashboard">
                <Drawer.Screen name="Dashboard" component={Dashboard} />
                <Drawer.Screen name="Clients" component={Clients} />
                <Drawer.Screen name="ShowClient" component={ShowClient} />
                <Drawer.Screen name="EditClient" component={EditClient} />
                <Drawer.Screen name="AddClient" component={AddClient} />
                <Drawer.Screen name="DeleteClient" component={DeleteClient} />
                <Drawer.Screen name="SearchClient" component={SearchClient} />
                <Drawer.Screen name="SyncClient" component={SyncClient} />
                <Drawer.Screen name="Categories" component={Categories} />
                <Drawer.Screen name="ShowProduits" component={ShowProduits} />
                <Drawer.Screen name="ShowAllProduits" component={ShowAllProduits} />
                <Drawer.Screen name="SyncCategoriesProduits" component={SyncCategoriesProduits} />
                <Drawer.Screen name="SearchCategoriesProduits" component={SearchCategoriesProduits} />
                <Drawer.Screen name="SearchProduits" component={SearchProduits} />
                <Drawer.Screen name="ShowProduitInfos" component={ShowProduitInfos} />
                <Drawer.Screen name="EditProduitInfos" component={EditProduitInfos} />
                <Drawer.Screen name="Commandes" component={Commandes} />
                <Drawer.Screen name="SyncCommandes" component={SyncCommandes} />
                <Drawer.Screen name="ShowCommande" component={ShowCommande} />
                <Drawer.Screen name="Panier_" component={Panier_} />
                <Drawer.Screen name="Recap" component={Recap} />
                <Drawer.Screen name="Validation_commande" component={Validation_commande} />
                <Drawer.Screen name="A_propos" component={A_propos} />
                <Drawer.Screen name="Downloading_commandes" component={Downloading_commandes} />
            </Drawer.Navigator>
        </NavigationContainer>
    );
}


