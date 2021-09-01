import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import DownloadingData_clients from '../screens/data/downloading_data_clients';

const screens = {
    DownloadingData_clients: {
        screen: DownloadingData_clients,
        navigationOptions: {
            headerShown: false,
        }
    }
}

const ClientsDataDownloading_navigator = createStackNavigator(screens);
export default createAppContainer(ClientsDataDownloading_navigator);
