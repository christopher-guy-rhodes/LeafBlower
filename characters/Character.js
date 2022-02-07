import {React, useContext, useEffect, useState} from 'react';
import {Animated, Dimensions, Easing, Image, Pressable, Text, View} from 'react-native';
import {GameContext} from "../game/game-context";
import {ACTION_TRANSITIONS, LEFT, LONG_PRESS, PPS, RIGHT, SHORT_PRESS, STOP} from "../util/constants";


const Character = (props) => {
    const [frameIndex, setFrameIndex] = useState(0);
    const [animationId, setAnimationId] = useState(0);
    const [action, setAction] = useState(STOP);
    const [direction, setDirection] = useState(props.defaultDirection);
    const [characterConfig, setCharacterConfig] = useState(props.characterConfig[direction][action]);
    const [x] = useState(new Animated.Value(getDefaultX()));
    const [y] = useState(new Animated.Value(Dimensions.get('window').height - props.spriteHeight));

    const heightOffset = props.characterConfig[direction][action]['heightOffset'];

    function animateCharacter(e, newAction){
        setAction(newAction);

        let characterConfig = props.characterConfig[direction][newAction];
        setCharacterConfig(characterConfig);

        Animated.timing(x).stop();

        if (characterConfig[PPS] > 0) {
            let duration;
            let xDest;
            if (direction === RIGHT) {
                // duration is distance to go divided by pixels per second
                duration = (Dimensions.get('window').width - props.spriteWidth - x._value) / characterConfig['pps'] * 1000;
                xDest = Dimensions.get('window').width - props.spriteWidth;
            } else {
                duration = x._value / characterConfig['pps'] * 1000;
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
                        animateCharacter(e, STOP);
                    }
                }
            });
        }

        let index = 0;
        let animationId = setInterval(() => {

            if (index > characterConfig['offsets'].length - 1) {
                if (characterConfig['loop'] === false) {
                    clearInterval(animationId);
                    return;
                } else {
                    index = 0;
                }
            }
            console.log('%s frame index is %d x:%o',props.id, index, getCurrentX());
            setFrameIndex(index);
            index++;
        }, 1000 / characterConfig['fps']);
        setAnimationId(animationId);
    }

    function getCurrentX() {
        if (state['gameState']['positions'][props.id] === undefined) {
            return 0;
        }
        return state['gameState']['positions'][props.id]['x']._value;
    }

    function getCurrentY() {
        if (state['gameState']['positions'][props.id] === undefined) {
            return 0;
        }
        return state['gameState']['positions'][props.id]['y']._value;
    }

    function getDefaultX() {
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
        return defaultX;
    }

    function handlePress(e, pressType, animationId) {
        clearInterval(animationId);
        animateCharacter(e, ACTION_TRANSITIONS[pressType][action]);
        setFrameIndex(0);
    }

    const state = useContext(GameContext);
    //state.setState({theme : themes.dark, setTheme : state.setTheme});

    // Wrap in useEffect to run only wen the data changes and not on every component prop update
    useEffect(() => {
        //console.log('state is %o', state);
        if (state['gameState']['positions'][props.id] === undefined) {
            state['gameState']['positions'][props.id] = {x : 0, y : 0};
        }


        state['gameState']['positions'][props.id]['x'] = x;
        state['gameState']['positions'][props.id]['y'] = y;
        state.setGameState(state.gameState);
    },[]);

    return (
        <Pressable onPress= {(e) => handlePress(e, SHORT_PRESS, animationId)}
                   onLongPress={(e) => handlePress(e, LONG_PRESS, animationId)}>
            <Animated.View style={{width: props.spriteWidth,
                          height: props.spriteHeight,
                          overflow: 'hidden',
                          border: '1px solid black',
                          left : x,
                          top  : y,
                          position : 'absolute'}}>

                <Text>
                    id:{props.id}<br/>
                    action:{action}<br/>
                    direction:{direction}<br/>
                    image x offset:{-1 * characterConfig['offsets'][frameIndex] * props.spriteWidth}<br/>
                    image y offset:{heightOffset * props.spriteHeight}<br/>
                    fps: {props.characterConfig[direction][action]['fps']}<br/>
                    x: {getCurrentX()}<br/>
                    y: {getCurrentY()}
                </Text>
                <Image source={props.sheetImage}
                    style={{
                        position: 'absolute',
                        top: -1 * heightOffset * props.spriteHeight,
                        left: -1 * characterConfig['offsets'][frameIndex] * props.spriteWidth,
                        width: props.sheetWidth,
                        height: props.sheetHeight }} />
            </Animated.View>
        </Pressable>
    );
}

export default Character;
