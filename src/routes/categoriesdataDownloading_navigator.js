import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import DownloadingData_categories from '../screens/data/downloading_data_categories';

const screens = {
    DownloadingData_categories: {
        screen: DownloadingData_categories,
        navigationOptions: {
            headerShown: false,
        }
    }
}

const CategoriesDataDownloading_navigator = createStackNavigator(screens);
export default createAppContainer(CategoriesDataDownloading_navigator);
