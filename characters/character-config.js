const CHARACTER_CONFIG = {right : {
        walk : {
            offsets      : [1, 2, 3, 4, 5, 6],
            fps          : 7,
            pps          : 200,
            heightOffset : 0,
            loop         : true},
        attack : {
            offsets      : [0, 1, 2, 3, 4, 5, 6, 7],
            fps          : 7,
            heightOffset : 4,
            loop         : false},
        stop : {
            offsets      : [0],
            fps          : 0,
            heightOffset : 0,
            loop         : false},
        run : {
            offsets      : [0, 1, 2, 3, 4, 5],
            fps          : 12,
            pps          : 300,
            heightOffset : 2,
            loop         : true}
    },
    left : {
        walk : {
            offsets      : [5, 4, 3, 2, 1, 0],
            fps          : 7,
            pps          : 150,
            heightOffset : 1,
            loop         : true},
        attack : {
            offsets      : [7, 6, 5, 4, 3, 2, 1, 0],
            fps          : 7,
            heightOffset : 5,
            loop         : false},
        stop : {
            offsets      : [6],
            fps          : 0,
            heightOffset : 1,
            loop         : false},
        run : {
            offsets      : [5, 4, 3, 2, 1, 0],
            fps          : 12,
            pps          : 500,
            heightOffset : 3,
            loop         : true}
    }};

const ACTION_TRANSITIONS = {
    shortPress : {
        walk   : 'run',
        stop   : 'walk',
        attack : 'attack',
        run    : 'walk'
    },
    longPress : {
        walk   : 'stop',
        stop   : 'stop',
        attack : 'stop',
        run    : 'stop'
    },
    doubleClick : {
        walk   : 'attack',
        stop   : 'attack',
        attack : 'walk',
        run    : 'attack'
    }
};

export {ACTION_TRANSITIONS, CHARACTER_CONFIG};
