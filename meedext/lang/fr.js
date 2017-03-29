export default {
  status: {
    ready: 'Prêt',
    lostConnection: 'Connexion perdue... reconnexion',
    connecting: 'Connexion...',
    notConnected: 'Pas connecté'
  },
  color: {
    red: 'rouge',
    blue: 'bleu',
    green: 'vert'
  },
  motor: {
    front: 'avant',
    back: 'arrière'
  },
  distance: {
    left: 'gauche',
    front: 'avant',
    right: 'droit'
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
  block: {
    walk: "marcher %n pas vers l\' %m.dir",
    turn: 'tourner %n pas à %m.side',
    leg: 'déplacer la jambe %m.leg en x: %n y: %n',
    ledColor: 'allumer la led en %m.color',
    distance: 'distance %m.distance',
    setMotor: 'mettre le moteur %m.motor de la jambe %m.leg en position %n',
    connect: 'connecter à %s',
    state: 'état du robot'
  }
}
