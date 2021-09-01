import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';

const Spinner =() => {
    return (
        <View style={StyleSheet.spinner}>
            <ActivityIndicator size={'large'} />
        </View>
    );
}

const style = StyleSheet.create({
    spinner: {
        flex:1,
        justifyContent:'center',
        alignContent:'center',
    }
});

export {Spinner}