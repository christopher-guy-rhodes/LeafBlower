const STOP = 'stop';

const RIGHT = 'right';
const LEFT = 'left';

const SHORT_PRESS = 'shortPress';
const LONG_PRESS = 'longPress';

const PPS = 'pps';

const ACTION_TRANSITIONS = {
    shortPress : {
        walk   : 'run',
        stop   : 'walk',
        attack : 'walk',
        run    : 'stop'
    },
    longPress : {
        walk   : 'attack',
        stop   : 'attack',
        attack : 'attack',
        run    : 'attack'
    }
};

export {ACTION_TRANSITIONS, LEFT, LONG_PRESS, PPS, RIGHT, SHORT_PRESS, STOP}
