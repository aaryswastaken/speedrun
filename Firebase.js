import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

// const settings = {timestampsInSnapshots: true};
const settings = {};

const config = require('./firecfg.json');

console.log(config);

(async () => {
  await firebase.initializeApp(config);
})();

firebase.firestore().settings(settings);

export default firebase;
