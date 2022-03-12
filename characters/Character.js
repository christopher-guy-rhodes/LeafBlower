import {React, useContext, useEffect, useState} from 'react';
import {Animated, Dimensions, Easing, Image, Pressable, Text, View} from 'react-native';
import {PositionContext} from "../game/position-context";
import {ATTACK, BACKGROUND_SIZE_PX, DOUBLE_CLICK, DOUBLE_CLICK_THRESHOLD_MS, FPS, LEFT, LONG_PRESS, PPS, PRESS_OUT,
    RIGHT, SHORT_PRESS, STOP, WALK, SCROLLING_ACTIONS} from "../util/constants";
import {ACTION_TRANSITIONS} from "./character-config";
import backgroundImage from "../assets/backgrounds/scrolling-desert.png";
import * as ScreenOrientation from 'expo-screen-orientation';
import {BackgroundContext} from "../game/background-context";
import {Gesture, GestureDetector} from "react-native-gesture-handler";

const LANDSCAPE_ORIENTATIONS =
    [ScreenOrientation.Orientation.LANDSCAPE_LEFT, ScreenOrientation.Orientation.LANDSCAPE_RIGHT];

const Character = (props) => {
    const [frameIndex, setFrameIndex] = useState(0);
    const [spriteAnimationId, setSpriteAnimationId] = useState(0);
    const [action, setAction] = useState(STOP);
    const [direction, setDirection] = useState(props.defaultDirection);
    const [characterConfig, setCharacterConfig] = useState(props.characterConfig[direction][action]);
    const [x, setX] = useState(new Animated.Value(getDefaultX()));
    const [y, setY] = useState(new Animated.Value(getBottomY()));
    const [backgroundOffset] = useState(new Animated.Value(-1334));
    const [clickEvent, setClickEvent] = useState(false);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
    const [pressY, setPressY] = useState(0);
    const [syncingY, setSyncingY] = useState(false);
    const [targetY, setTargetY] = useState(0);

    const positions = useContext(PositionContext);
    const backgroundInfo = useContext(BackgroundContext);

    const HEIGHT_OFFSET = props.characterConfig[direction][action]['heightOffset'];

    /**
     * Handle a press out event
     * @param e the press event
     * @param spriteAnimationId the current sprite animation id of the character.
     */
    function handlePressOut(e, spriteAnimationId) {

        setClickEvent(true);
        setTimeout(function () {
            setClickEvent(false);
        }, DOUBLE_CLICK_THRESHOLD_MS);

        clearInterval(spriteAnimationId);
        animateCharacter(e.nativeEvent.pageX, e.nativeEvent.pageY, clickEvent ? ATTACK : STOP, direction);
    }

    /**
     * Handle a long press event
     * @param e the press event
     * @param spriteAnimationId the current sprite animation id of the character.
     */
    function handleLongPress(e, animationId) {
        setPressY(e.nativeEvent.pageY);
        clearInterval(animationId);
        animateCharacter(e.nativeEvent.pageX, e.nativeEvent.pageY - props.spriteHeight / 2, WALK, direction);
    }

    /**
     * Handle a press in event
     * @param e the press event
     * @param spriteAnimationId the current sprite animation id of the character.
     */
    function handlePressIn(e) {
        clearInterval(spriteAnimationId);
        handleDirectionChange(e.nativeEvent.pageX, e.nativeEvent.pageY);
    }

    /**
     * Animate the movement and sprite frames of the character.
     *
     * @param toX the x coordinate to go to
     * @param toY the y coordinate to go to
     * @param act the action to animate
     * @param dir the direction the character is facing (left or right)
     */
    function animateCharacter(toX, toY, act, dir, fpsAdjust = 0){

        stopCharacterMovement()
        setAction(act);
        setFrameIndex(0);

        let characterConfig = props.characterConfig[dir][act];
        setBackgroundPps(dir, characterConfig[PPS]);
        setCharacterConfig(characterConfig);

        animateBackground(act, dir);
        let spriteAnimationId = animateCharacterSprite(toX, toY, act, dir, characterConfig);

        //if (!props.bindClicks) {
            animateCharacterMovement(toX, toY, spriteAnimationId, characterConfig[PPS] + fpsAdjust);
        //}
    }

    /**
     * Sets the pixels per second of the background dictated by the pixels per second of the main characters current
     * action. Performs a noop of the character is not the main character (the character with clicks bound).
     *
     * @param dir the direction of the character used to set the default direction
     * @param pps the pixels per second of the character
     */
    function setBackgroundPps(dir, pps) {
        if (props.bindClicks) {
            if (backgroundInfo['backgroundInfo'] === undefined) {
                backgroundInfo['backgroundInfo'] = {'pps' : 0, 'direction': dir === LEFT ? RIGHT : LEFT};
            }
            backgroundInfo['backgroundInfo']['pps'] = pps;
            backgroundInfo.setBackgroundDetail(backgroundInfo.backgroundInfo);
        }
    }

    /**
     * Animate a sprite given a character configuration that includes the frame offsets, frames per second and loop
     * configuration. Looks for changes in the background movement to adjust the pixels per second to account for
     * the illusion of movement of the character due to the background motion caused by the main character "moving".
     *
     * @param toX the x coordinate to move to
     * @param toY the y coordinate to move to
     * @param act the action to animate
     * @param dir the direction the character is facing (left or right)
     * @param characterConfig the character configuration
     * @returns {number} the sprite animation id
     */
    function animateCharacterSprite(toX, toY, act, dir, characterConfig) {
        let index = 0;
        let timeout = characterConfig[FPS] === 0 ? 0 : 1000 / characterConfig[FPS];
        let initialBackgroundPps = backgroundInfo['backgroundInfo'][PPS] === undefined ? 0 : backgroundInfo['backgroundInfo'][PPS];
        let animationId = setInterval(() => {

            if (index > characterConfig['offsets'].length - 1) {
                if (characterConfig['loop'] === false) {
                    clearInterval(animationId);
                    return;
                } else {
                    index = 0;
                }
            }
            recordPosition();

            if (!props.bindClicks) {
                let backgroundPps = backgroundInfo['backgroundInfo'][PPS] === undefined ? 0 : backgroundInfo['backgroundInfo'][PPS];
                if (backgroundPps != initialBackgroundPps) {
                    // If background is moving in the same direction of the character add to the pps, otherwise subtract
                    let adjusted = backgroundPps * (dir !== backgroundInfo['backgroundInfo']['direction'] ? -1 : 1);

                    // Stop movement and sprite animation and restart it with the adjusted pps
                    clearInterval(animationId);
                    stopCharacterMovement();
                    animateCharacter(toX, toY, act, dir, adjusted);
                }
            }

            setFrameIndex(index);
            index++;
        }, timeout);
        setSpriteAnimationId(animationId);
        return animationId;
    }

    /**
     * Move the character at pps pixels per second to coordinate toX, toY. Stop the sprite animation identified by
     * animationId when the movement is complete.
     *
     * @param toX the x coordinate to move to
     * @param toY the y coordinate to move to
     * @param animationId the sprite animation id
     * @param pps the pixels per second to move at
     */
    function animateCharacterMovement(toX, toY, animationId, pps) {

        if (pps > 0/* && !props.bindClicks*/) {

            if (props.bindClicks) {
                toX = x._value;
                toY = Math.min(toY, getBottomY());
                setTargetY(toY);
                console.log('animating %s toY: %s', props.id, toY);
            }

            let duration = pps === 0
                ? 0
                : getDistanceToCoordinate(toX, toY) / pps * 1000;

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
                if (!props.bindClicks) {
                    clearInterval(animationId);
                }
            });
        }
    }

    /**
     * Animate the background to give the illusion that the character is moving horizontally.
     *
     * @param action the action the character is currently performing
     * @param direction the direction the character is currently pointing
     */
    function animateBackground(action, direction) {

        stopBackgroundAnimation();
        if (!props.bindClicks || !SCROLLING_ACTIONS.includes(action)) {
            return;
        }

        let characterConfig = props.characterConfig[direction][action];

        let toValue = 0;
        let distance = 0;
        if (direction === RIGHT) {
            //console.log('moving right from value %s to value is %s', backgroundOffset._value, -2668);
            toValue = backgroundOffset._value - BACKGROUND_SIZE_PX;
            toValue = -2668;
            distance = Math.abs(backgroundOffset._value - toValue);
        } else {
            //console.log('moving left from value %s and to value is %s', backgroundOffset._value, 0);
            toValue = backgroundOffset._value + BACKGROUND_SIZE_PX;
            toValue = 0;
            distance = Math.abs(backgroundOffset._value - toValue);
        }

        if (props.bindClicks) {

            Animated.timing(
                backgroundOffset,
                {
                    toValue: toValue,
                    duration: distance / characterConfig[PPS] * 1000,
                    easing: Easing.linear,
                    useNativeDriver: false
                }
            ).start(({ finished }) => {
                console.log('done animating at %s, setting offset to %s', backgroundOffset._value, getOffsetForDirection(direction));
                clearInterval(spriteAnimationId);

                console.log('background animation done was it finished? %s', finished);

                if (finished) {
                    if (direction === RIGHT) {
                        backgroundOffset.setValue(-1*BACKGROUND_SIZE_PX);
                        animateBackground(action, direction);
                    } else {
                        //backgroundOffset.setValue()
                        backgroundOffset.setValue(-1*BACKGROUND_SIZE_PX);
                        animateBackground(action, direction);
                    }
                }
            });
        }

    }

    /**
     * Handles possible direction change. If the character is changing direction the background image loaded needs to be
     * changed to the appropriate copy (left, right or center) so that the edge of the 3 copies of the background images
     * is not shown.
     * @param e the press event
     */
    function handleDirectionChange(pageX, pageY) {
        let dir = isChangingDirectionTo(pageX, pageY, LEFT)
            ? LEFT
            : isChangingDirectionTo(pageX, pageY, RIGHT) ? RIGHT : direction;

        setDirection(dir);

        setBackgroundDirection(dir);
    }

    /**
     * Set the direction the background is moving. Saves to the parent component state.
     *
     * @param dir the direction the main character is moving
     */
    function setBackgroundDirection(dir) {
        if (props.bindClicks) {

            if (backgroundInfo['backgroundInfo'] === undefined) {
                backgroundInfo['backgroundInfo'] = {'pps' : 0, 'direction': dir === LEFT ? RIGHT : LEFT};
            }
            backgroundInfo['backgroundInfo']['direction'] = dir === LEFT ? RIGHT : LEFT;
            backgroundInfo.setBackgroundDetail(backgroundInfo.backgroundInfo);
        }
    }

    /**
     * Stops the character movement
     */
    function stopCharacterMovement() {
        if (x !== undefined) {
            Animated.timing(x, {useNativeDriver: false}).stop();
        }
        if (y != undefined) {
            Animated.timing(y, {useNativeDriver: false}).stop();
        }

    }

    /**
     * Records the coordinates for the character to the parent shared state.
     */
    function recordPosition() {
        if (positions['positions'][props.id] === undefined) {
            positions['positions'][props.id] = {x : x._value, y : y._value};
        }

        positions['positions'][props.id]['x'] = x._value;
        positions['positions'][props.id]['y'] = y._value;

        positions.setCharacterPositions(positions.positions);
    }

    /**
     * In order to support looped background scrolling there are three copies of the background image (left, center and
     * right). If the character has moved right of the center of the background and is facing right the left background
     * image copy is loaded so that when the character advances right the edge of the screen is not shown (instead the
     * center copy is advanced into). Similarly if the character has moved left of center and is facing left the right
     * background image copy is used. If neither of these conditions are met the character can move without the risk
     * of the edge of the three images being visible.
     *
     * @param direction the direction the character is moving
     * @returns {number} the new offset based on the character's direction and the current backround position.
     */
    function getOffsetForDirection(direction) {

        if (direction === RIGHT && backgroundOffset._value < -1*BACKGROUND_SIZE_PX) {
            return backgroundOffset._value + BACKGROUND_SIZE_PX;
        } else if (direction === LEFT && backgroundOffset._value > -1*BACKGROUND_SIZE_PX) {
            return backgroundOffset._value - BACKGROUND_SIZE_PX;
        } else {
            return backgroundOffset._value;
        }
    }

    /**
     * Determines of the character is changing direction to the test direction with the new click
     * @param e the click event
     * @param testDir the direction to test
     * @returns {boolean} true if the character is changing direction to testDir, false otherwise.
     */
    function isChangingDirectionTo(pageX, pageY, testDir) {
        let xValue = x._value !== undefined ? x._value : getDefaultX();
        return testDir === LEFT
            ? direction === RIGHT && pageX < xValue + props.spriteWidth / 2
            : direction === LEFT && pageX >= xValue + props.spriteWidth / 2;
    }

    /**
     * Stops the background animation.
     */
    function stopBackgroundAnimation() {
        //Animated.timing(backgroundOffset, {useNativeDriver: false}).stop();
        backgroundOffset.setValue(backgroundOffset._value);
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
        return props.defaultPosition === undefined ? (Dimensions.get('window').width - props.spriteWidth) / 2
                                                   : props.defaultPosition;
    }

    useEffect(() => {
        //registerPositions();

        if (props.id !== 'barbarian') {
            animateCharacter(0, getBottomY() + props.spriteHeight - props.spriteHeight, WALK, 'left');
        }

        ScreenOrientation.addOrientationChangeListener((event) => {
            setScreenHeight(Dimensions.get('window').height);
            if (props.bindClicks) {
                setX(getDefaultX());
            }
            setY(getBottomY());

            if (props.id !== 'barbarian') {
                animateCharacter(0, getBottomY() + props.spriteHeight - props.spriteHeight, WALK, 'left');
            }

        });

    },[]);

    function changedVerticalDirection() {
        return pressY - props.spriteHeight / 2 < y._value && pressY - props.spriteHeight / 2 >= targetY ||
          pressY - props.spriteHeight / 2 >= y._value && pressY - props.spriteHeight / 2 <= targetY;
    }

    function changedHorizontalDirection(pressX) {
        return pressX - props.spriteWidth / 2 < x._value && direction == RIGHT ||
            pressX - props.spriteWidth / 2 >= x._value && direction === LEFT;
    }

    const panGesture = Gesture.Pan()
        .onFinalize((e) => {
            Animated.timing(y).stop();
            setSyncingY(false);
            setTargetY(y._value);
            setPressY(targetY);
            clearInterval(spriteAnimationId);
            animateCharacter(e.absoluteX, e.absoluteY, STOP, direction);
        })
        .onTouchesMove((e) => {
            let touches = e.changedTouches[e.numberOfTouches - 1];
            setPressY(touches.absoluteY);
            let pressX = touches.absoluteX;


            if (changedHorizontalDirection(pressX)) {
                clearInterval(spriteAnimationId);
                handleDirectionChange(pressX, pressY);
                animateCharacter(pressX, pressY, WALK, direction === RIGHT ? LEFT : RIGHT);
            }

            if (changedVerticalDirection()) {
                setSyncingY(false);
            }

            if (props.bindClicks && SCROLLING_ACTIONS.includes(WALK)) {
                if (pressY !== targetY) {
                    setTargetY(pressY - props.spriteHeight / 2);
                }

                if (!syncingY && y._value !== targetY) {
                    setSyncingY(true);

                    Animated.timing(y, {
                        toValue : targetY,
                        duration : Math.abs(y._value - targetY) / characterConfig[PPS] * 1000,
                        easing: Easing.linear,
                        useNativeDriver: false
                    }).start((successful) => {
                        setSyncingY(false);
                    });
                }
            }
        });


    return (
        <GestureDetector gesture={panGesture}>
        <Pressable
            onLongPress={(e) => handleLongPress(e, spriteAnimationId)}
            /*
            onPressOut={(e) => handlePressOut(e, spriteAnimationId)}

             */
            onPressIn={(e) => handlePressIn(e, spriteAnimationId)}
            pointerEvents={props.bindClicks ? 'auto' : 'none'}
            style={{zIndex: props.bindClicks ? 0 : 1}}>
            <View style={{
                width: props.bindClicks ? 1334 : 0,
                height: props.bindClicks ? Math.min(750, screenHeight) : 0,
                overflow: 'hidden',
                left: 0,
                top: Math.max(0, screenHeight - 750),
                position: 'absolute'
            }}>
                <Animated.Image source={backgroundImage}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: backgroundOffset,
                                    // width is 3x for middle screen and left and right screensgree
                                    width: 3 * BACKGROUND_SIZE_PX,
                                    height: Math.min(750, screenHeight)
                                }}/>
            </View>

            <Animated.View style={{
                width: props.spriteWidth,
                height: props.spriteHeight,
                overflow: 'hidden',
                border: '1px solid black',
                left: x,
                top: y,
                position: 'absolute'
            }}>

                <Text>
                    {/*
                    backgroundOffset: {backgroundOffset._value}{"\n"}
                    pressY2: {pressY}
                    */}
                </Text>
                <Image source={props.sheetImage}
                       style={{
                           position: 'absolute',
                           top: -1 * HEIGHT_OFFSET * props.spriteHeight,
                           left: -1 * characterConfig['offsets'][frameIndex] * props.spriteWidth,
                           width: props.sheetWidth,
                           height: props.sheetHeight
                       }}/>
            </Animated.View>
        </Pressable>
        </GestureDetector>);
}

export default Character;
