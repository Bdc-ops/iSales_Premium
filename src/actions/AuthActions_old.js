
import { LOGIN_ATTEMPT, LOGIN_SUCCESS, LOGIN_FAILED } from './types';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';

export const auth = ({ username, password, srv_name }) => {


  return (dispatch) => {
    dispatch({ type: LOGIN_ATTEMPT });
    //###################################################
    // get infos from Extern auth API
    //###################################################
    axios.get(`http://bigdataconsulting.fr/isales/api/auth.php?srv_name=${srv_name}`)
      .then(response => {
        console.log('==============================');
        console.log('DB URL : ' + `http://bigdataconsulting.fr/isales/api/auth.php?srv_name=${srv_name}`);
        console.log('Reponse URL status : ' + response.status);
        console.log('Reponse API_o DB status : ' + response.data.respdata.status);
        console.log('==============================');
        if (response.data.respdata.status === 200) {
          serv = response.data.respdata.server_url;
          console.log('Returned serveur : ' + serv);
          //###################################################
          // get infos from API dolibarr
          //###################################################

          axios.get(`${response.data.respdata.server_url}/api/index.php/login?login=${username}&password=${password}`)
            .then(response => {
              if (response.status === 200) {
                console.log('User URL : ' + `${response.data.respdata.server_url}/api/index.php/login?login=${username}&password=${password}`);
                console.log('Reponse URL status' + response.status);
                console.log('Reponse OK');
                console.log('==============================');
                onLoginSuccess(dispatch, response.data.success.token, serv, username, srv_name)
              } else {
                onLoginFailed(dispatch, "Vos informations d'authentification sont incorrect")
                console.log("ERROR : Vos informations d'authentification sont incorrect");
                console.log('==============================');
              }
            })
            .catch(error => {
              onLoginFailed(dispatch, "Vos informations d'authentification sont incorrect");
              console.log("ERROR User Connection URL:" + error);
              console.log('==============================');
            }
            );
          //###################################################

        } else {
          onLoginFailed(dispatch, "Vos informations d'authentification sont incorrect");
          console.log("ERROR API_DB Connection URL Status");
          console.log('==============================');
        }
      })
      .catch(error => {
        onLoginFailed(dispatch, "Vos informations d'authentification sont incorrect")
        console.log("ERROR API_DB Connection URL : " + error);
        console.log('==============================');
      }
      );



  };
}


const onLoginSuccess = (dispatch, token, serv_n, username, srv_name) => {
  AsyncStorage.setItem('user_token', token)
    .then(() => {
      AsyncStorage.setItem('serv_name', serv_n)
        .then(() => {
          AsyncStorage.setItem('username', username);
          AsyncStorage.setItem('societe', srv_name);
          dispatch({ type: LOGIN_SUCCESS, token: token, server: serv_n });
        })
    })
    .catch(error => onLoginFailed(dispatch, "Vos informations d'authentification sont incorrect"));
};

const onLoginFailed = (dispatch, errorMessage) => {
  dispatch({ type: LOGIN_FAILED, error: errorMessage });
};


