import {React, useEffect, useState} from 'react';
import {Animated, Dimensions, Easing, Image, Pressable, Text, View} from 'react-native';
import {newRangeCount} from "react-native-web/dist/vendor/react-native/VirtualizeUtils";

const ACTION_TRANSITIONS = {
    shortPress : {
        walk   :'run',
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
}

const Sprite = (props) => {
    const ATTACK = 'attack';
    const WALK = 'walk';
    const STOP = 'stop';
    const RUN = 'run';

    const RIGHT = 'right';
    const LEFT = 'left';

    const SHORT_PRESS = 'shortPress';
    const LONG_PRESS = 'longPress';

    const [frameIndex, setFrameIndex] = useState(0);
    const [animationId, setAnimationId] = useState(0);
    const [action, setAction] = useState(STOP);
    const [direction, setDirection] = useState(RIGHT);
    const [actionConfiguration, setActionConfiguration] = useState(props.frames[direction][action]);
    const [x] = useState(new Animated.Value(0));

    const heightOffset = props.frames[direction][action]['heightOffset'];

    function animateSprite(e, newAction){
        setAction(newAction);
        let actionConfig = props.frames[direction][newAction];
        setActionConfiguration(actionConfig);

        Animated.timing(x).stop();

        if (actionConfig['pps'] > 0) {
            let duration = undefined;
            let xDest = undefined;
            if (direction === RIGHT) {
                // duration is distance to go divided by pixels per second
                duration = (Dimensions.get('window').width - props.width - x._value) / actionConfig['pps'] * 1000;
                xDest = Dimensions.get('window').width - props.width;
            }

            let startedAtBoundary = xDest === x._value;

            Animated.timing(
                x,
                {
                    toValue: xDest,
                    duration: duration,
                    easing: Easing.linear
                }
            ).start(({ finished }) => {
                clearInterval(animationId);

                if (x._value === xDest) {
                    if (!startedAtBoundary) {
                        animateSprite(e, STOP);
                    }
                }
            });
        }

        let index = 0;
        let animationId = setInterval(() => {

            if (index > actionConfig['offsets'].length - 1) {
                if (actionConfig['loop'] === false) {
                    clearInterval(animationId);
                    return;
                } else {
                    index = 0;
                }
            }
            console.log('frame index for action %s is %d',newAction, index);
            setFrameIndex(index);
            index++;
        }, 1000 / actionConfig['fps']);
        setAnimationId(animationId);
    }

    function handlePress(e, pressType, animationId) {
        clearInterval(animationId);
        animateSprite(e, ACTION_TRANSITIONS[pressType][action]);
        setFrameIndex(0);
    }

    return (
        <Pressable onPress= {(e) => handlePress(e, SHORT_PRESS, animationId)}
                   onLongPress={(e) => handlePress(e, LONG_PRESS, animationId)}>
            <Animated.View style={{width: props.width,
                          height: props.height,
                          overflow: 'hidden',
                          border: '1px solid black',
                          left : x}}>

                <Text>
                    action:{action}<br/>
                    direction:{direction}<br/>
                    offset:{-1 * actionConfiguration['offsets'][frameIndex] * props.width}<br/>
                    height offset:{heightOffset * props.height}<br/>
                    fps: {props.frames[direction][action]['fps']}
                </Text>
                <Image source={props.image}
                    style={{
                        position: 'absolute',
                        top: -1 * heightOffset * props.height,
                        left: -1 * actionConfiguration['offsets'][frameIndex] * props.width,
                        width: props.sheetWidth,
                        height: props.sheetHeight }} />
            </Animated.View>
        </Pressable>
    );
}

export default Sprite;
