/* global ScratchExtensions */

import createMeed from './meed'


let ext = function() {
  let host = '127.0.0.1'
  let port = 9009

  let meed = createMeed()

  ext._stop = function() {
    console.log('Should stop all motions.')
  }

  ext._shutdown = function() {
    meed.disconnect()
  }

  ext._getStatus = function() {
    if (meed.status == meed.CONNECTED) {
      if (meed.recentlyUpdated) {
        return { status: 2, msg: 'Ready' }
      } else {
        // Forcing a disconnect should then trigger
        // a reconnect when the status switch to NOT_CONNECTED
        meed.disconnect()

        return { status: 1, msg: 'Connection lost, attempt to re-connect' }
      }

    } else if (meed.status == meed.CONNECTING) {
      return { status: 1, msg: 'Connecting...' }

    } else if (meed.status == meed.NOT_CONNECTED){
      meed.connect(host, port)

      return { status: 0, msg: 'Not connected' }
    }
  }

  // Motion blocks

  ext.moveLeg = (leg, x, y) => {
    // The params x, y are exepected to be in the range [-1, 1]
    // They are mapped to the cartesian coordinates
    // of the end effector of the leg (in mm)
    // x € [-30, 30]
    // y € [15, 60]

    // Make sure x, y belong to [-1, 1]
    x = (x <= -1) ? -1 : ((x >= 1) ? 1 : x)
    y = (y <= -1) ? -1 : ((y >= 1) ? 1 : y)

    // Inverse axis to match Scratch one
    x = -x
    y = -y

    // Map the values to their cartesian coordinates
    x = 30 * x
    y = 37.5 + y * 22.5

    // TODO: convert from 'front left' to 'front_left_leg'

    meed.moveLeg(leg, x, y)
  }

  ext.walk = (steps, direction, callback) => {
    meed.walk(steps, direction).then(callback)
  }

  ext.turn = (steps, direction, callback) => {
    meed.turn(steps, direction).then(callback)
  }

  // Sensor

  ext.getDistance = (sensor) => meed.state.distance[sensor]

  // Debug block

  ext.setMotorPosition = (leg, motor, position) => {
    // Transform leg, motor
    meed.setMotorPosition(leg, motor, position)
  }

  ext.connectToHost = (_host) => {
    host = _host
    meed.disconnect()
  }

  ext.getState = () => {
    console.log(meed.state)
  }

  let descriptor = {
    blocks: [
      // Walk
      ['w', 'walk %n steps %m.dir', 'walk', 1, 'forward' ],
      ['w', 'turn %n steps %m.side', 'turn', 1, 'left'],
      ['-'],

      // Motion
      [' ', 'move %m.leg to x: %n y: %n', 'moveLeg', 'front left', 0, 0],
      ['-'],

      // LED
      [' ', 'change led color to %m.color', 'setColor', 'red'],

      // Sensing
      ['r', '%m.distance distance', 'getDistance', 'front'],

      // Debug
      ['--'],
      [' ', 'set %m.motor motor of the %m.leg leg to position %n', 'setMotorPos', 'front', 'front left', 0],
      [' ', 'connect to %s', 'connectToHost'],
      [' ', 'robot state', 'getState'],
    ],
    menus: {
      dir: ['forward', 'backward'],
      side: ['left', 'right'],
      leg: ['front left', 'front right', 'back left', 'back right'],
      color: ['red', 'blue', 'green'],
      distance: ['left', 'front', 'right'],
      motor: ['front', 'back'],
    },
    url: '',
  }

  // Register the extension
  ScratchExtensions.register('Meed', descriptor, ext)
}

ext({})
