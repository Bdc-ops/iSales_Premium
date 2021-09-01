import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import DownloadingData_produits from '../screens/data/downloading_data_produits';

const screens = {
    DownloadingData_produits: {
        screen: DownloadingData_produits,
        navigationOptions: {
            headerShown: false,
        }
    }
}

const ProduitsDataDownloading_navigator = createStackNavigator(screens);
export default createAppContainer(ProduitsDataDownloading_navigator);
