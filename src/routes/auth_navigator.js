import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Login from '../screens/Login';

const screens = {
    Login: {
        screen: Login,
        navigationOptions: {
            headerShown: false,
        }
    }
}

const auth_navigator = createStackNavigator(screens);
export default createAppContainer(auth_navigator);
