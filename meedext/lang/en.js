export default {
  status: {
    ready: 'Ready',
    lostConnection: 'Lost connection... reconnecting',
    connecting: 'Connecting...',
    notConnected: 'Not connected'
  },
  color: {
    red: 'red',
    blue: 'blue',
    green: 'green'
  },
  motor: {
    front: 'front',
    back: 'back'
  },
  distance: {
    left: 'left',
    front: 'front',
    right: 'right'
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
  block: {
    walk: 'walk %n steps %m.dir',
    turn: 'turn %n steps %m.side',
    leg: 'move %m.leg leg to x: %n y: %n',
    ledColor: 'change led color to %m.color',
    distance: '%m.distance distance',
    setMotor: 'set %m.motor motor of the %m.leg leg to position %n',
    connect: 'connect to %s',
    state: 'robot state'
  }
}
