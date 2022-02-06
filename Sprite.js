import {React, useContext, useEffect, useState} from 'react';
import {Animated, Dimensions, Easing, Image, Pressable, Text, View} from 'react-native';
import {newRangeCount} from "react-native-web/dist/vendor/react-native/VirtualizeUtils";
import {ThemeContext, themes} from "./theme-context";

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
    const CENTER = 'center';

    const SHORT_PRESS = 'shortPress';
    const LONG_PRESS = 'longPress';

    const [frameIndex, setFrameIndex] = useState(0);
    const [animationId, setAnimationId] = useState(0);
    const [action, setAction] = useState(STOP);
    const [direction, setDirection] = useState(props.defaultDirection);
    const [actionConfiguration, setActionConfiguration] = useState(props.frames[direction][action]);

    let defaultX = undefined;
    switch(props.defaultPosition) {
        case RIGHT:
            defaultX = Dimensions.get('window').width - props.spriteWidth;
            break;
        case LEFT:
            defaultX = 0;
            break;
        case CENTER:
        default:
            defaultX = (Dimensions.get('window').width - props.spriteWidth) / 2;
            break;
    }

    const [x] = useState(new Animated.Value(defaultX));

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
                duration = (Dimensions.get('window').width - props.spriteWidth - x._value) / actionConfig['pps'] * 1000;
                xDest = Dimensions.get('window').width - props.spriteWidth;
            } else {
                duration = x._value / actionConfig['pps'] * 1000;
                xDest = 0;
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

    const state = useContext(ThemeContext);
    //state.setState({theme : themes.dark, setTheme : state.setTheme});

    useEffect(() => {

        let flag = true;
        setInterval(function() {
            state.setTheme(flag ? themes.dark : themes.light);
            flag = flag ? false : true;
        },2000);

        //state.setTheme(themes.light);
    },[]);

    return (
        <Pressable onPress= {(e) => handlePress(e, SHORT_PRESS, animationId)}
                   onLongPress={(e) => handlePress(e, LONG_PRESS, animationId)}>
            <Animated.View style={{width: props.spriteWidth,
                          height: props.spriteHeight,
                          overflow: 'hidden',
                          border: '1px solid black',
                          left : x,
                          position : 'absolute'}}>

                <Text>
                    action:{action}<br/>
                    direction:{direction}<br/>
                    offset:{-1 * actionConfiguration['offsets'][frameIndex] * props.spriteWidth}<br/>
                    height offset:{heightOffset * props.spriteHeight}<br/>
                    fps: {props.frames[direction][action]['fps']}<br/>
                    positions: {state.theme.background}
                </Text>
                <Image source={props.sheetImage}
                    style={{
                        position: 'absolute',
                        top: -1 * heightOffset * props.spriteHeight,
                        left: -1 * actionConfiguration['offsets'][frameIndex] * props.spriteWidth,
                        width: props.sheetWidth,
                        height: props.sheetHeight }} />
            </Animated.View>
        </Pressable>
    );
}

export default Sprite;
