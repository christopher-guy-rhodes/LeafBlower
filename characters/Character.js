import {React, useContext, useEffect, useState} from 'react';
import {Animated, Dimensions, Easing, Image, Pressable, Text, View} from 'react-native';
import {GameContext} from "../game/game-context";
import {DOUBLE_CLICK, DOUBLE_CLICK_THRESHOLD_MS, FPS, LEFT, LONG_PRESS, PPS, RIGHT, SHORT_PRESS, STOP} from "../util/constants";
import {ACTION_TRANSITIONS} from "./character-config";


const Character = (props) => {
    const [frameIndex, setFrameIndex] = useState(0);
    const [animationId, setAnimationId] = useState(0);
    const [action, setAction] = useState(STOP);
    const [direction, setDirection] = useState(props.defaultDirection);
    const [characterConfig, setCharacterConfig] = useState(props.characterConfig[direction][action]);
    const [x] = useState(new Animated.Value(getDefaultX()));
    const [y] = useState(new Animated.Value(getBottomY()));
    const [clickEvent, setClickEvent] = useState(false);

    const HEIGHT_OFFSET = props.characterConfig[direction][action]['heightOffset'];

    /**
     * Animate the movement and sprite frames of the character.
     *
     * @param e the click event
     * @param act the action to animate
     * @param dir the direction the character is facing (left or right)
     */
    function animateCharacter(e, act, dir){
        setAction(act);

        let characterConfig = props.characterConfig[dir][act];
        setCharacterConfig(characterConfig);

        Animated.timing(x).stop();
        Animated.timing(y).stop();

        // Animate the movement
        if (characterConfig[PPS] > 0) {
            let newCoordinate = getNewCoordinate(e, dir);
            let duration = getDistanceToCoordinate(newCoordinate) / characterConfig[PPS] * 1000;

            Animated.parallel([
                    Animated.timing(
                        x,
                        {
                            toValue: newCoordinate['x'],
                            duration: duration,
                            easing: Easing.linear
                        }),
                    Animated.timing(
                        y,
                        {
                            toValue: newCoordinate['y'],
                            duration: duration,
                            easing: Easing.linear
                        })

                ]
            ).start(({ finished }) => {
                clearInterval(animationId);
            });
        }

        // Animate the frames
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
            setFrameIndex(index);
            index++;
        }, 1000 / characterConfig[FPS]);
        setAnimationId(animationId);
    }


    /**
     * Get the distance from the current coordinate of the character to the given coordinate using the pythagorean
     * theorem.
     *
     * @param coordinate the coordinate to calculate the distance to
     * @returns {number} the distance
     */
    function getDistanceToCoordinate(coordinate) {
        return Math.sqrt(Math.pow(Math.abs(coordinate['x'] - x._value), 2) +
            Math.pow(Math.abs(coordinate['y'] - y._value), 2))
    }

    /**
     * Get a new coordinate that is on the line formed from the current coordinate and the clicked coordinate. The
     * most extreme values of x and y will be selected that are still on screen.
     *
     * @param e the click event
     * @param direction the direction of the character
     * @returns the new coordinate e.g. {{x: number, y: number}}
     */
    function getNewCoordinate(e, direction) {
        let x1 = x._value;
        let y1 = y._value;
        let x2 = e.pageX - props.spriteWidth / 2;
        let y2 = e.pageY - props.spriteHeight / 2;

        let xBoundary = direction === RIGHT ? Dimensions.get('window').width - props.spriteWidth : 0;

        // equation of the line : y = mx + b
        let m = (y2 - y1) / (x2 - x1);
        let b = y1 - m * x1;

        let isClickOnTopPortion = y2 < y1;

        // Get the value of x using the equation
        let newX = isClickOnTopPortion ?  -b/m : (getBottomY() - b)/m;

        // If x is off screen set it to the screen boundary
        if (direction === RIGHT && newX > xBoundary) {
            newX = Dimensions.get('window').width - props.spriteWidth;
        } else if (direction === LEFT && newX < xBoundary) {
            newX = 0;
        }

        // Get the value of y using the equation
        let newY = m * newX + b;

        // If y is off screen set it to the screen boundary
        if (newY < 0) {
            newY = 0;
        } else if (newY > getBottomY()) {
            newY = getBottomY();
        }

        return {
            x : newX,
            y : newY,
        }
    }

    /**
     * Get the current x coordinate of the character
     *
     * @returns {number|*}
     */
    function getCurrentX() {
        return (state['gameState']['positions'][props.id] === undefined)
            ? 0
            : state['gameState']['positions'][props.id]['x']._value;
    }

    /**
     * Get the current y coordinate of the character
     * @returns {number} the current value of y
     */
    function getCurrentY() {
        return (state['gameState']['positions'][props.id] === undefined)
            ? 0
            : state['gameState']['positions'][props.id]['y']._value;
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

        let act = ACTION_TRANSITIONS[clickEvent ? DOUBLE_CLICK : pressType][action];

        setClickEvent(true);
        setTimeout(function () {
            setClickEvent(false);
        }, DOUBLE_CLICK_THRESHOLD_MS);

        let dir = direction;
        let didChangeDirection = false;

        if (direction === RIGHT && e.pageX < (x._value + props.spriteWidth / 2)) {
            dir = LEFT;
            setDirection(dir);
            act = action;
        } else if (direction == LEFT && e.pageX >= (x._value + props.spriteWidth / 2)) {
            dir = RIGHT;
            setDirection(dir);
            act = action;
        }

        clearInterval(animationId);
        animateCharacter(e, act, dir);
        setFrameIndex(0);
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
    },[]);

    return (
        <Pressable onPress= {(e) => handlePress(e, SHORT_PRESS, animationId)}
                   onLongPress={(e) => handlePress(e, LONG_PRESS, animationId)}>
            <View style={{position : 'absolute', width : Dimensions.get('window').width, height : Dimensions.get('window').height, userSelect: 'none'}}>
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
                    image y offset:{HEIGHT_OFFSET * props.spriteHeight}<br/>
                    fps: {props.characterConfig[direction][action][FPS]}<br/>
                    pps: {props.characterConfig[direction][action][PPS]}<br/>
                    x: {getCurrentX()}<br/>
                    y: {getCurrentY()}<br/>
                    animationId: {animationId}
                </Text>
                <Image source={props.sheetImage}
                    style={{
                        position: 'absolute',
                        top: -1 * HEIGHT_OFFSET * props.spriteHeight,
                        left: -1 * characterConfig['offsets'][frameIndex] * props.spriteWidth,
                        width: props.sheetWidth,
                        height: props.sheetHeight }} />
            </Animated.View>
            </View>
        </Pressable>
    );
}

export default Character;
