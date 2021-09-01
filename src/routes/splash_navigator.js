import React from 'react';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import SplashScreen from '../screens/Splash';

const screens ={
SplashScreen: {
    screen:SplashScreen,
    navigationOptions: {
        headerShown: false,
      }
}
}

const splash_navigator = createStackNavigator(screens);
export default createAppContainer(splash_navigator);
