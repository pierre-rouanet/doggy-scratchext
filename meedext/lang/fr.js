export default {
  status: {
    ready: 'Prêt',
    lostConnection: 'Connexion perdue... reconnexion',
    connecting: 'Connexion...',
    notConnected: 'Pas connecté'
  },
  color: {
    black: 'noir',
    red: 'rouge',
    blue: 'bleu',
    green: 'vert',
    yellow: 'jaune',
    purple: 'violet',
    cyan: 'cyan',
    white: 'blanc'
  },
  motor: {
    front: 'avant',
    back: 'arrière'
  },
  distance: {
    servo_0: 'gauche',
    servo_1: 'avant',
    servo_2: 'droit',
    servo_3: 'arrière',
  },
  leg: {
    front_left: 'avant gauche',
    front_right: 'avant droite',
    back_left: 'arrière gauche',
    back_right: 'arrière droite'
  },
  side: {
    left: 'gauche',
    right: 'droite'
  },
  direction: {
    forward: 'avant',
    backward: 'arrière'
  },
  led: {
    led_0: '1',
    led_1: '2',
    led_2: '3',
    led_3: '4'
  },
  block: {
    walk: "marcher %n pas vers l\' %m.dir",
    turn: 'tourner %n pas à %m.side',
    leg: 'déplacer la jambe %m.leg en x: %n y: %n',
    ledColor: 'allumer la led %m.led en %m.color',
    distance: 'distance %m.distance',
    setMotor: 'mettre le moteur %m.motor de la jambe %m.leg en position %n',
    connect: 'connecter à %s',
    state: 'état du robot'
  }
}
