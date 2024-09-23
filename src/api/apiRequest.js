import AsyncStorage from '@react-native-async-storage/async-storage';
// import {GoogleSignin} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import {showMessage} from 'react-native-flash-message';
const apiRequest = async function (urlType, options) {
  const authToken = await AsyncStorage.getItem('@auth_token');
  const onSuccess = response => {
    return response.data;
  };
  const onError = error => {
    console.log('Axios Error', error);
    if (error.response && error.response.status) {
      console.log('Response Status:', error.response.status);

      if (
        error.response.status === 400 ||
        error.response.status === 404 ||
        error.response.status === 403
      ) {
        showMessage({
          message: error?.response?.data?.message
            ? error?.response?.data?.message
            : error?.response?.data?.message,
          type: 'danger',
          color: '#fff',
          backgroundColor: 'red',
          floating: true,
        });
      } else if (error.response.status === 304) {
        return error?.response;
      } else if (error?.response?.status === 302) {
        return error?.response;
      } else if (error.response.status === 401) {
        showMessage({
          message: error?.response?.data?.detail?.message
            ? error?.response?.data?.detail?.message
            : error?.response?.data?.message,
          type: 'danger',
          color: '#fff',
          backgroundColor: 'red',
          floating: true,
        });
      } else if (error.response.status === 500) {
        showMessage({
          message: `Appologies! There is something on our side. We're working on it`,
          type: 'danger',
          color: '#fff',
          backgroundColor: 'red',
          floating: true,
        });
      }
    } else if (error.request) {
      console.error('The request was made but no response was received.');
      console.error('Request Details:', error.request);

      // Handle network errors, e.g., show a message to the user
    } else {
      console.error('Error response structure is unexpected.');
    }
    return false;
  };

  return axios({
    baseURL: urlType,
    ...options,
    headers: {Authorization: `${authToken}`},
  })
    .then(onSuccess)
    .catch(onError);
};
export default apiRequest;
