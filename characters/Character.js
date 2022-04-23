import {React, useContext, useEffect, useState} from 'react';
import {Animated, Dimensions, Easing, Image, Pressable, Text, View} from 'react-native';
import {PositionContext} from "../game/position-context";
import {ATTACK, BACKGROUND_WIDTH_PX, BACKGROUND_HEIGHT_PX, DOUBLE_CLICK, DOUBLE_CLICK_THRESHOLD_MS, FPS, LEFT,
    LONG_PRESS, PPS, PRESS_OUT, RIGHT, SHORT_PRESS, STOP, WALK, SCROLLING_ACTIONS} from "../util/constants";
import {ACTION_TRANSITIONS} from "./character-config";
import backgroundImage from "../assets/backgrounds/scrolling-desert.png";
import * as ScreenOrientation from 'expo-screen-orientation';
import {BackgroundContext} from "../game/background-context";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {CharacterAnimation, CharacterAnimationBuilder} from "../animation/CharacterAnimation";

const LANDSCAPE_ORIENTATIONS =
    [ScreenOrientation.Orientation.LANDSCAPE_LEFT, ScreenOrientation.Orientation.LANDSCAPE_RIGHT];

const Character = (props) => {
    const [frameIndex, setFrameIndex] = useState(0);
    const [spriteAnimationId, setSpriteAnimationId] = useState(0);
    const [action, setAction] = useState(STOP);
    const [direction, setDirection] = useState(props.defaultDirection);
    const [characterConfig, setCharacterConfig] = useState(props.characterConfig[direction][action]);
    const [x, setX] = useState(new Animated.Value(CharacterAnimation.getDefaultX(props)));
    const [y, setY] = useState(new Animated.Value(CharacterAnimation.getBottomY(props)));
    const [backgroundOffset] = useState(new Animated.Value(-1334));
    const [clickEvent, setClickEvent] = useState(false);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
    const [pressY, setGestureY] = useState(0);
    const [syncingY, setSyncingY] = useState(false);
    const [targetY, setTargetY] = useState(0);

    const backgroundInfo = useContext(BackgroundContext);
    const positions = useContext(PositionContext);


    const characterAnimation = new CharacterAnimationBuilder(characterConfig, props)
        .withAction(action)
        .withSetAction(setAction)
        .withDirection(direction)
        .withSetDirection(setDirection)
        .withSetGestureY(setGestureY)
        .withSyncingY(syncingY)
        .withSetSyncingY(setSyncingY)
        .withTargetY(targetY)
        .withSetTargetY(setTargetY)
        .withY(y)
        .withX(x)
        .withPressY(pressY)
        .withPps(PPS)
        .withBackgroundInfo(backgroundInfo)
        .withSpriteAnimationId(spriteAnimationId)
        .withSetSpriteAnimationId(setSpriteAnimationId)
        .withBackgroundOffset(backgroundOffset)
        .withFrameIndex(frameIndex)
        .withSetFrameIndex(setFrameIndex)
        .withSetCharacterConfig(setCharacterConfig)
        .withPositions(positions).build();


    const HEIGHT_OFFSET = props.characterConfig[direction][action]['heightOffset'];

    useEffect(() => {
        characterAnimation.recordPosition();

        if (!props.bindClicks) {
            characterAnimation.animateCharacter(0, CharacterAnimation.getBottomY(props) + props.spriteHeight - props.spriteHeight, WALK, 'left');
        }

        if (props.defaultPosition && props.bindClicks) {
            throw new Error("Cannot set default position for the main characterrr");
        }

        ScreenOrientation.addOrientationChangeListener((event) => {
            setScreenHeight(Dimensions.get('window').height);

            let barbarianXDelta = positions['positions']['barbarian']['x'] + Dimensions.get('window').height - props.spriteWidth;
            if (props.bindClicks) {
                setX(new Animated.Value(CharacterAnimation.getDefaultX(props)));
            } else {
                x.setOffset(barbarianXDelta);
            }
            setY(new Animated.Value(CharacterAnimation.getBottomY(props)));

            if (props.id !== 'barbarian') {
                characterAnimation.animateCharacter(-1*barbarianXDelta, CharacterAnimation.getBottomY(props) + props.spriteHeight - props.spriteHeight, WALK, 'left');
            }

        });

    },[]);

    const panGesture = Gesture.Pan()
        .onBegin((e) => {
            clearInterval(spriteAnimationId);
            characterAnimation.handleDirectionChange(e.absoluteX, e.absoluteY);
        })
        .onStart((e) => {
            setGestureY(e.absoluteY);
            clearInterval(spriteAnimationId);
            characterAnimation.animateCharacter(e.absoluteX,e.absoluteY - props.spriteHeight / 2, WALK, direction);

        })
        .onFinalize((e) => {
            Animated.timing(y).stop();
            setSyncingY(false);
            setTargetY(y._value);
            setGestureY(targetY);
            clearInterval(spriteAnimationId);
            characterAnimation.animateCharacter(e.absoluteX, e.absoluteY, STOP, direction);
        })
        .onTouchesMove((e) => {
            let touches = e.changedTouches[e.numberOfTouches - 1];
            characterAnimation.syncYToGesture(touches.absoluteX, touches.absoluteY);

        });


    return (
        <GestureDetector gesture={panGesture}>
        {/* Outer view container */}
        <View
            /* Non-main characters need a greater zIndex so that they are not behind the background */
            style={{zIndex: props.bindClicks ? 0 : 1}}
            /* Disable pointer events for characters except the main character so that they don't respond to gestures */
            pointerEvents={props.bindClicks ? 'auto' : 'none'}>
            {/* Visible background container */}
            <View style={{
                width: BACKGROUND_WIDTH_PX,
                height: props.bindClicks ? Math.min(BACKGROUND_HEIGHT_PX, screenHeight) : 0,
                overflow: 'hidden',
                left: 0,
                top: Math.max(0, screenHeight - BACKGROUND_HEIGHT_PX),
                position: 'absolute'
            }}>
                {/* Scrolling background image */}
                <Animated.Image source={backgroundImage}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: backgroundOffset,
                                    // width is 3x for middle screen and left and right screens
                                    width: 3 * BACKGROUND_WIDTH_PX,
                                    height: Math.min(BACKGROUND_HEIGHT_PX, screenHeight)
                                }}/>
            </View>

            {/* Character sprite container */}
            <Animated.View style={{
                width: props.spriteWidth,
                height: props.spriteHeight,
                overflow: 'hidden',
                left: x,
                top: y,
                position: 'absolute'
            }}>

                <Text>
                    positions: {JSON.stringify(positions)}
                    {/*
                    backgroundOffset: {backgroundOffset._value}{"\n"}
                    pressY2: {pressY}
                    */}
                </Text>
                {/* Character sheep image*/}
                <Image source={props.sheetImage}
                       style={{
                           position: 'absolute',
                           top: -1 * HEIGHT_OFFSET * props.spriteHeight,
                           left: -1 * characterConfig['offsets'][frameIndex] * props.spriteWidth,
                           width: props.sheetWidth,
                           height: props.sheetHeight
                       }}/>
            </Animated.View>
        </View>
        </GestureDetector>);
}

export default Character;
