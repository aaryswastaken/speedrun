import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';

import {Button, Icon, ListItem} from 'react-native-elements';

import {Stopwatch} from 'react-native-stopwatch-timer';

import firebase from './Firebase.js';

const steps = [
  {name: 'Escaliers'},
  {name: "File d'attente"},
  {name: 'Service'},
  {name: 'Entrée'},
  {name: 'Plat'},
  {name: 'Dessert'},
  {name: 'Débarassage'},
  {name: 'Table'},
];

const defaultIfNull = ' - - - - - ';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stopwatchStart: false,
      totalDuration: 90000,
      stopwatchReset: false,
      msec: undefined,
      times: JSON.parse(JSON.stringify(steps)), // Horrible but functional referenceless copy
      nextStep: 0,
    };

    console.log(this.state.times);

    this.toggleStopwatch = this.toggleStopwatch.bind(this);
    this.resetStopwatch = this.resetStopwatch.bind(this);
    this.getFormattedTime = this.getFormattedTime.bind(this);
    this.nextStep = this.nextStep.bind(this);
  }

  componentDidMount() {
    (async () => {
      console.log(
        await firebase
          .firestore()
          .collection('users')
          .doc('VU4mXV7kkkSdtZzz1Jji')
          .get(),
      );
    })();
  }

  sendRun() {
    return new Promise((resolve, reject) => {
      try {
        var payload = {
          class: 'Cantine LLA',
          run_info: {
            epoch: new Date().getTime(),
            runner: 'VU4mXV7kkkSdtZzz1Jji',
          },
          run: {},
        };

        this.state.times.forEach(time => {
          payload.run[time.name] = time;
        });
      } catch (e) {
        reject(e);
      }

      console.log(payload);

      firebase
        .firestore()
        .collection('runs')
        .add(payload)
        .then(() => {
          alert('Added :)');
          resolve();
        });
    });
  }

  toggleStopwatch() {
    this.setState({
      stopwatchStart: !this.state.stopwatchStart,
      stopwatchReset: false,
    });
  }

  resetStopwatch() {
    this.setState({
      stopwatchStart: false,
      stopwatchReset: true,
      times: JSON.parse(JSON.stringify(steps)),
      nextStep: 0,
    });
  }

  getFormattedTime(time) {
    this.currentTime = time;
  }

  parseTimeFromStr(time) {
    console.log(time);
    return time
      .split(':')
      .map((e, i) => {
        return parseInt(e) * [60 * 60, 60, 1, 1 / 1000][i];
      })
      .reduce((a, b) => a + b, 0);
  }

  parseTimeFromFloat(time) {
    let d = new Date(time * 1000);
    return `${d.getUTCHours()}:${d.getMinutes()}:${d.getSeconds()}:${d.getMilliseconds()}`;
  }

  nextStep() {
    let times = this.state.times;
    console.log(this.state.nextStep);
    console.log(this.state.times.length);
    if (this.state.nextStep !== this.state.times.length) {
      times[this.state.nextStep].time = this.currentTime;
      this.setState({times, nextStep: this.state.nextStep + 1});
    }

    if (this.state.nextStep > this.state.times.length - 2) {
      console.log('elo');
      if (this.state.stopwatchStart) {
        this.toggleStopwatch();
      }
    }
  }

  timeSinceLast(key, value) {
    if (
      typeof value.time === 'undefined' ||
      typeof this.state.times[key - 1] === 'undefined' ||
      typeof (this.state.times[key - 1] ?? {}).time === 'undefined'
    ) {
      return defaultIfNull;
    }

    let delta =
      this.parseTimeFromStr(value.time) -
      this.parseTimeFromStr(this.state.times[key - 1].time);

    console.log(`${JSON.stringify(steps)}`);

    return this.parseTimeFromFloat(delta);
  }

  getCurrentTime() {
    return this.currentTime ?? '0:0:0:0';
  }

  render() {
    return (
      <View style={{backgroundColor: '#fff'}}>
        <Stopwatch
          laps
          msecs
          start={this.state.stopwatchStart}
          reset={this.state.stopwatchReset}
          options={options}
          getMesc={time => {
            console.log(time);
          }}
          getTime={this.getFormattedTime}
        />
        <ListItem style={styles.buttonView} key={'buttons'}>
          <Icon
            name={!this.state.stopwatchStart ? 'play' : 'pause'}
            type={'font-awesome'}
            onPress={this.toggleStopwatch}
            size={30}
            style={styles.icons}
            key={'play'}
          />
          <Icon
            name={'stop'}
            type={'font-awesome'}
            onPress={this.resetStopwatch}
            size={30}
            style={styles.icons}
            key={'stop'}
          />
          <Icon
            name={'check'}
            type={'font-awesome'}
            onPress={this.nextStep}
            size={30}
            style={styles.icons}
            key={'next'}
          />
        </ListItem>
        <View style={styles.stepsContainer}>
          {Object.entries(this.state.times).map(([key, value]) => {
            return (
              <View>
                <Text style={styles.stepDescription}>
                  {key} : {value.name}
                </Text>
                <Text style={styles.stepTime}>
                  {value.time ?? defaultIfNull} /{' '}
                  {this.timeSinceLast(key, value)}
                </Text>
              </View>
            );
          }, this)}
        </View>
        <View>
          <Button
            disabled={
              this.state.times[this.state.times.length - 1].time === undefined
            }
            onPress={async () => {
              await this.sendRun();
            }}>
            <Text>SEND RUN</Text>
          </Button>
        </View>
        {/*<Button
          onPress={async () => {
            console.log(await firebase.firestore().collection('users').get());
          }}>
          <Text>Dump db :)</Text>
        </Button>*/}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  stepDescription: {
    fontSize: 24,
  },
  stepTime: {
    fontSize: 20,
  },
  stepsContainer: {
    paddingTop: 50,
    paddingLeft: 20,
  },
  buttonView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icons: {},
});

const options = {
  container: {
    textAlign: 'center',
    backgroundColor: '#FFF',
    margin: 50,
  },
  text: {
    color: '#000',
    textAlign: 'center',
    fontSize: 42,
  },
};

export default App;
