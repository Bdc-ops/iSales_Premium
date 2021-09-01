import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import DownloadingData_commandes_ from '../screens/data/downloading_data_commandes';

const screens = {
    DownloadingData_commandes: {
        screen: DownloadingData_commandes_,
        navigationOptions: {
            headerShown: false,
        }
    }
}

const DownloadingData_commandes = createStackNavigator(screens);
export default createAppContainer(DownloadingData_commandes);
