import {React, useEffect, useState} from 'react';
import {Animated, Dimensions, Easing, Image, Pressable, Text, View} from 'react-native';

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
    const [offsets, setOffsets] = useState(props.frames[direction][action]['offsets']);
    const [x] = useState(new Animated.Value(0));

    const heightOffset = props.frames[direction][action]['heightOffset'];

    function animateSprite(e, newAction){
        let actionConfig = props.frames[direction][newAction];
        setOffsets(actionConfig['offsets']);

        Animated.timing(x).stop();

        if (actionConfig['pps'] > 0) {
            let duration = undefined;
            let xDest = undefined;
            if (direction === RIGHT) {
                // duration is distance to go divided by pixels per second
                duration = (Dimensions.get('window').width - props.width - x._value) / actionConfig['pps'] * 1000;
                xDest = Dimensions.get('window').width - props.width;
            }
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
                    console.log('hit boundary');
                    //animateSprite(e, STOP);
                }
                /* completion callback */
            });
        }

        let index = 0;
        let animationId = setInterval(() => {

            if (index > actionConfig['offsets'].length - 1) {
                if (actionConfig['loop'] === false) {
                    return;
                } else {
                    index = 0;
                }
            }
            console.log('frame index %d', index);
            setFrameIndex(index++);
        }, 1000 / actionConfig['fps']);
        setAnimationId(animationId);
        return newAction;
    }

    function handlePress(e, pressType, animationId) {
        clearInterval(animationId);
        setAction(animateSprite(e, ACTION_TRANSITIONS[pressType][action]));
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
                    offset:{-1 * offsets[frameIndex] * props.width}&nbsp;
                    height offset:{heightOffset * props.height}&nbsp;
                    fps: {props.frames[direction][action]['fps']}
                </Text>
                <Image source={props.image}
                    style={{
                        position: 'absolute',
                        top: -1 * heightOffset * props.height,
                        left: -1 * offsets[frameIndex] * props.width,
                        width: props.sheetWidth,
                        height: props.sheetHeight }} />
            </Animated.View>
        </Pressable>
    );
}

export default Sprite;
