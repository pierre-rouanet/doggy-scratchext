export default {
  status: {
    ready: 'Ready',
    connecting: 'Connecting...',
    disconnecting: 'Disconnecting...',
    notConnected: 'Not connected',
  },
  color: {
    black: 'black',
    red: 'red',
    blue: 'blue',
    green: 'green',
    yellow: 'yellow',
    purple: 'purple',
    cyan: 'cyan',
    white: 'white'
  },
  motor: {
    front: 'front',
    back: 'back'
  },
  distance: {
    servo_0: 'left',
    servo_1: 'front',
    servo_2: 'right',
    servo_3: 'back',
  },
  leg: {
    front_left: 'front left',
    front_right: 'front right',
    back_left: 'back left',
    back_right: 'back right'
  },
  side: {
    left: 'left',
    right: 'right'
  },
  direction: {
    forward: 'forward',
    backward: 'backward'
  },
  led: {
    led_0: '1',
    led_1: '2',
    led_2: '3',
    led_3: '4'
  },
  block: {
    walk: 'walk %n steps %m.dir',
    turn: 'turn %n steps %m.side',
    leg: 'move %m.leg leg to x: %n y: %n',
    ledColor: 'change led %m.led color to %m.color',
    distance: '%m.distance distance',
    setMotor: 'set %m.motor motor of the %m.leg leg to position %n',
    connect: 'connect to %s',
    state: 'robot state'
  }
}
