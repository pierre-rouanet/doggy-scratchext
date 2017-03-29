/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }]*/

import * as walkAnim from './walk'

export default function createMeed() {
  const possibleStatus = {
    CONNECTED: 1,
    CONNECTING: 2,
    NOT_CONNECTED: 4
  }

  let ws = null
  let state = {}
  let status = possibleStatus.NOT_CONNECTED

  let heartbeatTimestamp = null
  const heartbeatTimeout = 1000 // in ms

  // Motion

  let setMotorPosition = (leg, motor, position) => {
    const cmd = {
      [leg]: {
        [motor]: {
          target_position: position
        }
      }
    }

    send(cmd)
  }

  let moveLeg = (leg, x, y) => {
    const cmd = {
      [leg]: {
        x,
        y
      }
    }
    send(cmd)
  }

  let walk = (steps, direction) => {
    return new Promise((resolve, _reject) => {

      let i = 0

      let _walk = () => {
        let j = (direction === 'forward' ?
                 i :
                 walkAnim.stepLength - i - 1)

        let cmd = {}
        for (let legName in walkAnim.traj) {
          const leg = walkAnim.traj[legName]

          cmd[legName] = {
            front: {
              target_position: leg['front'][j]
            },
            back: {
              target_position: leg['back'][j]
            }
          }
        }
        send(cmd)

        i++
        if (i >= walkAnim.stepLength) {
          i = 0
          steps--

          if (steps <= 0) {
            resolve()
            return
          }
        }
        setTimeout(_walk, walkAnim.speed.normal)
      }
      _walk()
    })
  }

  let turn = (steps, direction) => {
    return new Promise((resolve, _reject) => {
      console.log('Should turn', steps, 'steps to the', direction)
      setTimeout(resolve, steps * 1000)
    })
  }

  // WS IO

  let connect = (host, port) => {
    if (ws) {
      console.error('Socket already opened.')
      return false
    }

    status = possibleStatus.CONNECTING

    const url = 'ws://' + host + ':' + port
    ws = new WebSocket(url)

    ws.onopen = () => {
      status = possibleStatus.CONNECTED

      send({
        refresh_ms: 30
      })
    }

    ws.onmessage = (e) => {
      if (typeof e.data == 'string') {
        try {
          const data = JSON.parse(e.data)
          state = data
        } catch(e) {
          console.error('Could not parse data ' + e.data)
        }
      }
      else {
        console.error('Binary data received not handled!')
      }
      const date = new Date()
      heartbeatTimestamp = date.getTime()
    }

    ws.onclose = () => {
      ws = null
      status = possibleStatus.NOT_CONNECTED
    }

    return ws
  }

  let disconnect = () => {
    if (ws.readyState === ws.OPEN ||
        ws.readyState === ws.CONNECTING) {

      ws.close()
    }
  }

  let recentlyUpdated = () => {
    const date = new Date()
    const t = date.getTime()

    let alive = (t - heartbeatTimestamp) < heartbeatTimeout
    return alive
  }

  let send = (data) => {
    console.log(data)
    ws.send(JSON.stringify(data))
  }

  let meed = Object.assign({},
    {
      setMotorPosition,
      moveLeg,

      walk,
      turn,

      connect,
      disconnect,
      send,
    },
    possibleStatus
  )

  return Object.defineProperties(meed,
    {
      state: {
        get: () => state
      },
      status: {
        get: () => status
      },
      recentlyUpdated: {
        get: () => recentlyUpdated()
      }
    }
  )
}
