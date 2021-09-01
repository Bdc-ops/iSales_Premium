import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, ScrollView, ImageBackground } from 'react-native';
import About_navbar from '../navbars/a_propos/about_navbar';
import CardView from 'react-native-cardview';

export default class A_propos extends React.Component {
    render() {
        const state = this.state;
        const { navigate } = this.props.navigation;
        return (

            <ScrollView contentContainerStyle={styles.containerMain} ref='_scrollView'>

                <About_navbar title={navigate}></About_navbar>

                <View style={styles.container}>
                    <View style={styles.containerResults}>

                        <CardView style={styles.cards} cardElevation={5} cornerRadius={10}>
                            <Text style={styles.titles}>A propos de la solution</Text>
                            <Text>iSales est une application de prise de commande sur tablette développé par Anexys - Big Data Consulting .</Text>
                            <Text>permet aux commerciaux d’avoir dans le creux de leur main un outil puissant et fiable.</Text>
                            <Text>Se rendre chez un client pour lui proposer vos produits n’a jamais été aussi simple. Notre solution est couplée à notre logiciel Edicloud, qui est un ERP complet et efficace, et vous permet de recevoir la commande sans aucune saisie ultérieur.</Text>
                        </CardView>

                        {/*<CardView style={styles.cards} cardElevation={5} cornerRadius={10}>
                            <Text style={styles.titles}>Témoignages</Text>
                            <Text>Commercial en Chef</Text>
                            <Text>"Une application complète et fonctionnelle qui séduit nos commerciaux".</Text>
                            <Text></Text>
                            <Text>Responsable S.A.V</Text>
                            <Text>"Une prise de commande simplifié et apprécié des clients, qui sont enthousiasmés par l'application"</Text>
                            <Text></Text>
                            <Text>Chef Comptable</Text>
                            <Text>"Un réel gain dans notre trésorie. iSales est un outil simple, efficace et mobile qui n'engendre aucun couts supplémentaire".</Text>

                          </CardView>*/}

                        <CardView style={styles.cards} cardElevation={5} cornerRadius={10}>
                            <Text style={styles.titles}>Nous contacter</Text>
                            <Text>Adresse : Big Data Consulting 17 boulevard de la Muette 95140 Garges-lés-gonesse.</Text>
                            <Text>E-mail : Commercial@anexys.fr</Text>
                            <Text>Site web : www.bigdataconsulting.fr</Text>

                        </CardView>





                    </View>
                </View>
            </ScrollView>
        );
    }
}




const styles = StyleSheet.create({
    containerMain: {
        flexGrow: 1,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        flexDirection: 'column',
    },
    containerResults: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20
    },
    cards: {
        margin: 10,
        width: '95%',
        padding: 20
    },
    titles: {
        color: '#00BFA6',
        fontSize: 22,
        marginBottom: 10,
    }

});