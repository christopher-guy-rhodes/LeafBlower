import {React, useContext, useEffect, useState} from 'react';
import {Animated, Dimensions, Easing, Image, Pressable, Text, View} from 'react-native';
import {GameContext} from "../game/game-context";
import {ATTACK, BACKGROUND_SIZE_PX, DOUBLE_CLICK, DOUBLE_CLICK_THRESHOLD_MS, FPS, LEFT, LONG_PRESS, PPS, PRESS_OUT,
    RIGHT, SHORT_PRESS, STOP, WALK} from "../util/constants";
import {ACTION_TRANSITIONS} from "./character-config";
import backgroundImage from "../assets/backgrounds/scrolling-desert.png";


const Character = (props) => {
    const [frameIndex, setFrameIndex] = useState(0);
    const [animationId, setAnimationId] = useState(0);
    const [action, setAction] = useState(STOP);
    const [direction, setDirection] = useState(props.defaultDirection);
    const [characterConfig, setCharacterConfig] = useState(props.characterConfig[direction][action]);
    const [x] = useState(new Animated.Value(getDefaultX()));
    const [y] = useState(new Animated.Value(getBottomY()));

    const [backgroundOffset, setBackgroundOffset] = useState(new Animated.Value(-1*BACKGROUND_SIZE_PX));

    const [clickEvent, setClickEvent] = useState(false);

    const HEIGHT_OFFSET = props.characterConfig[direction][action]['heightOffset'];

    /**
     * Handle a press event
     * @param e the press event
     * @param pressType the type of press (long press, regular etc.)
     * @param animationId the current sprite animation id of the character.
     */
    function handlePress(e, pressType, animationId) {
        if (!props.bindClicks) {
            console.log('clicks are not bound on ' + props.id)
            return;
        }

        //let act = ACTION_TRANSITIONS[clickEvent ? DOUBLE_CLICK : pressType][action];
        let act;
        switch (pressType) {
            case LONG_PRESS:
                act = WALK;
                break;
            case PRESS_OUT:
                default:
                act = STOP;
                break;
        }

        setClickEvent(true);
        setTimeout(function () {
            setClickEvent(false);
        }, DOUBLE_CLICK_THRESHOLD_MS);

        if (clickEvent) {
            act = ATTACK;
        }

        let dir = direction;
        let didChangeDirection = false;

        if (direction === RIGHT && e.nativeEvent.pageX < (x._value + props.spriteWidth / 2)) {
                dir = LEFT;
                setDirection(dir);

                console.log('changing direction from right to left background offset is %s new offset should be %s', backgroundOffset._value, backgroundOffset._value - BACKGROUND_SIZE_PX);
                setBackgroundOffset(new Animated.Value(backgroundOffset._value - BACKGROUND_SIZE_PX));
                //act = action;
                //act = STOP;
        } else if (direction == LEFT && e.nativeEvent.pageX >= (x._value + props.spriteWidth / 2)) {
                dir = RIGHT;
                setDirection(dir);
            console.log('changing direction from left to right background offset is %s new offset should be', backgroundOffset._value + BACKGROUND_SIZE_PX);
                setBackgroundOffset(new Animated.Value(backgroundOffset._value + BACKGROUND_SIZE_PX));
                //act = action;
                //act = STOP;
        }

        clearInterval(animationId);
        animateCharacter(e.nativeEvent.pageX, e.nativeEvent.pageY, act, dir);
        setFrameIndex(0);
    }


    /**
     * Animate the movement and sprite frames of the character.
     *
     * @param toX the x coordinate to go to
     * @param toY the y coordinate to go to
     * @param act the action to animate
     * @param dir the direction the character is facing (left or right)
     */
    function animateCharacter(toX, toY, act, dir){
        setAction(act);

        setFrameIndex(0);
        let characterConfig = props.characterConfig[dir][act];
        setCharacterConfig(characterConfig);

        if (!props.bindClicks) {
            Animated.timing(x, {useNativeDriver: false}).stop();
            Animated.timing(y, {useNativeDriver: false}).stop();
        }

        stopBackgroundAnimation();
        animateBackground(act, dir);

        // Animate the movement
        if (characterConfig[PPS] > 0 && !props.bindClicks) {
            let duration = characterConfig[PPS] === 0
                ? 0
                : getDistanceToCoordinate(toX, toY) / characterConfig[PPS] * 1000;

            Animated.parallel([
                    Animated.timing(
                        x,
                        {
                            toValue: toX,
                            duration: duration,
                            easing: Easing.linear,
                            useNativeDriver: false
                        }),
                    Animated.timing(
                        y,
                        {
                            toValue: toY,
                            duration: duration,
                            easing: Easing.linear,
                            useNativeDriver : false
                        })

                ]
            ).start(({ finished }) => {
                clearInterval(animationId);
            });
        }

        // Animate the frames
        let index = 0;
        let timeout = characterConfig[FPS] === 0 ? 0 : 1000 / characterConfig[FPS];
        let animationId = setInterval(() => {

            if (index > characterConfig['offsets'].length - 1) {
                if (characterConfig['loop'] === false) {
                    clearInterval(animationId);
                    return;
                } else {
                    index = 0;
                }
            }
            setFrameIndex(index);
            index++;
        }, timeout);
        setAnimationId(animationId);
    }

    function stopBackgroundAnimation() {
        Animated.timing(backgroundOffset, {useNativeDriver: false}).stop();
    }

    function animateBackground(action, direction) {

        if (!props.bindClicks || action !== WALK) {
            return;
        }

        let characterConfig = props.characterConfig[direction][action];

        let pps = characterConfig[PPS];
        let directionalSign = direction === RIGHT ? -1 : 1;
        let toOffset = backgroundOffset._value + directionalSign * BACKGROUND_SIZE_PX;
        let duration = BACKGROUND_SIZE_PX / pps * 1000;


        if (props.bindClicks) {
            console.log('%s from %s to %s',action, backgroundOffset._value, toOffset);

            Animated.loop(
            Animated.timing(
                backgroundOffset,
                {
                    toValue: toOffset,
                    duration: duration,
                    easing: Easing.linear,
                    useNativeDriver: false
                }
            )).start(({ finished }) => {
                console.log('finished setting offset to ' + backgroundOffset._value);

                if (direction === RIGHT && backgroundOffset._value < -1*BACKGROUND_SIZE_PX) {
                    if (backgroundOffset._value < -1*BACKGROUND_SIZE_PX) {
                        console.log('moved to the right of center (%s), reset background offset to%s', backgroundOffset._value, backgroundOffset._value + BACKGROUND_SIZE_PX);
                        setBackgroundOffset(new Animated.Value(backgroundOffset._value + BACKGROUND_SIZE_PX));
                    }
                } else if (direction === LEFT && backgroundOffset._value > -1*BACKGROUND_SIZE_PX) {
                    console.log('moved to the left of center (%s), reset background offset to %s', backgroundOffset._value, backgroundOffset._value - BACKGROUND_SIZE_PX);
                    setBackgroundOffset(new Animated.Value(backgroundOffset._value - BACKGROUND_SIZE_PX));
                } else {
                    setBackgroundOffset(new Animated.Value(backgroundOffset._value));
                }


                clearInterval(animationId);
            });
        }

    }

    /**
     * Get the distance from the current coordinate of the character to the given coordinate using the pythagorean
     * theorem.
     *
     * @param toX the x coordinate to calculate the distance to
     * @param toY the y coordinate to calculate the distance to
     * @returns {number} the distance
     */
    function getDistanceToCoordinate(toX, toY) {
        return Math.sqrt(Math.pow(Math.abs(toX - x._value), 2) +
            Math.pow(Math.abs(toY - y._value), 2))
    }

    /**
     * Get the y coordinate for the bottom of the screen
     *
     * @returns {number} the value of y at the bottom of the screen
     */
    function getBottomY() {
        return Dimensions.get('window').height - props.spriteHeight;
    }

    /**
     * Get the default value of the x coordinate based on the direction the character is facing
     *
     * @returns {number} the default value of x
     */
    function getDefaultX() {
        let defaultX = undefined;
        switch(props.defaultPosition) {
            case RIGHT:
                defaultX = Dimensions.get('window').width - props.spriteWidth;
                break;
            case LEFT:
                defaultX = 0;
                break;
            default:
                defaultX = (Dimensions.get('window').width - props.spriteWidth) / 2;
                break;
        }
        return defaultX;
    }

    const state = useContext(GameContext);

    // Set the shared state for the character as it moves around. Wrap in useEffect to run only wen the data changes and
    // not on every component prop update
    useEffect(() => {
        if (state['gameState']['positions'][props.id] === undefined) {
            state['gameState']['positions'][props.id] = {x : 0, y : 0};
        }

        state['gameState']['positions'][props.id]['x'] = x;
        state['gameState']['positions'][props.id]['y'] = y;
        state.setGameState(state.gameState);

        if (props.id !== 'barbarian') {
            animateCharacter(0, getBottomY() + props.spriteHeight - props.spriteHeight, WALK, 'left');
        }

    },[]);

    return (

        <Pressable /*onPress= {(e) => handlePress(e, SHORT_PRESS, animationId)}*/
                   onLongPress={(e) => handlePress(e, LONG_PRESS, animationId)}
                   onPressOut={(e) => handlePress(e, 'pressOut', animationId)}
                   style={{zIndex: props.bindClicks ? 0 : 1}}>
            <View style={{
                /*display: props.bindClicks ? 'flex' : 'none',*/
                width: props.bindClicks ? 1334 : 0,
                height: props.bindClicks ? 750 : 0,
                overflow: 'hidden',
                border: '1px solid blue',
                left : 0,
                top  : 0,
                position : 'absolute'}}>
                <Animated.Image source={backgroundImage}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: backgroundOffset,
                                    // width is 3x for middle screen and left and right screens
                                    width: 3 * BACKGROUND_SIZE_PX,
                                    height: 750
                                }}/>
            </View>

                <Animated.View style={{width: props.spriteWidth,
                              height: props.spriteHeight,
                              overflow: 'hidden',
                              border: '1px solid black',
                              left : x,
                              top  : y,
                              position : 'absolute'}}>

                    <Text>
                        {/*
                        backgroundOffset: {backgroundOffset._value}{"\n"}
                        id:{props.id}{"\n"}
                        x: {x._value}{"\n"}
                        y: {y._value}
                        action:{action}{"\n"}
                        direction:{direction}{"\n"}
                        image x offset:{-1 * characterConfig['offsets'][frameIndex] * props.spriteWidth}{"\n"}
                        image y offset:{HEIGHT_OFFSET * props.spriteHeight}{"\n"}
                        fps: {props.characterConfig[direction][action][FPS]}{"\n"}
                        pps: {props.characterConfig[direction][action][PPS]}{"\n"}
                        animationId: {animationId}{"\n"}
                        state:{JSON.stringify(state)}

                        */}
                    </Text>
                    <Image source={props.sheetImage}
                        style={{
                            position: 'absolute',
                            top: -1 * HEIGHT_OFFSET * props.spriteHeight,
                            left: -1 * characterConfig['offsets'][frameIndex] * props.spriteWidth,
                            width: props.sheetWidth,
                            height: props.sheetHeight}} />
                </Animated.View>
        </Pressable>
    );
}

export default Character;
