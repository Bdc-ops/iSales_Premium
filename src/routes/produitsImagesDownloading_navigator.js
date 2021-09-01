import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import DownloadingImages_produits from '../screens/data/downloading_images_produits';

const screens = {
    DownloadingImages_produits: {
        screen: DownloadingImages_produits,
        navigationOptions: {
            headerShown: false,
        }
    }
}

const ProduitsImagesDownloading_navigator = createStackNavigator(screens);
export default createAppContainer(ProduitsImagesDownloading_navigator);
