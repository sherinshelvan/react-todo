import * as firebase from 'firebase/app';
import 'firebase/database';

const config = {
  apiKey: "AIzaSyDSgTNtcVwZ7sJXBbVa8ot7wqnjmJ1OZQU",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "https://todo-list00.firebaseio.com/",
  projectId: "todo-list00",
  storageBucket: "gs://todo-list00.appspot.com"
};
firebase.initializeApp(config);

// const database = firebase.database();

export default firebase;
