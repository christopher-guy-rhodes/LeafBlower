import { React, useContext, useEffect, useState } from 'react';
import { Animated, Dimensions, Easing, Image, Pressable, Text, View } from 'react-native';
import { PositionContext } from "../game/position-context";
import {BACKGROUND_WIDTH_PX, BACKGROUND_HEIGHT_PX, RIGHT, STOP, WALK, LEFT} from "../util/constants";
import backgroundImage from "../assets/backgrounds/scrolling-desert.png";
import * as ScreenOrientation from 'expo-screen-orientation';
import { BackgroundContext } from "../game/background-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { CharacterAnimation } from "../animation/CharacterAnimation";
import {ScreenOrientationHelper} from "../screen/ScreenOrientationHelper";
import {Character } from "./Character";
import {BackgroundAnimation} from "../animation/BackgroundAnimation";

const LANDSCAPE_ORIENTATIONS =
    [ScreenOrientation.Orientation.LANDSCAPE_LEFT, ScreenOrientation.Orientation.LANDSCAPE_RIGHT];

const CharacterComponent = (props) => {
    const [frameIndex, setFrameIndex] = useState(0);
    const [spriteAnimationId, setSpriteAnimationId] = useState(0);
    const [action, setAction] = useState(STOP);
    const [direction, setDirection] = useState(props.defaultDirection);
    const [x, setX] = useState(new Animated.Value(Character.getDefaultX(props)));
    const [y, setY] = useState(new Animated.Value(CharacterAnimation.getBottomY(props)));
    const [backgroundOffset] = useState(new Animated.Value(-1334));
    const [clickEvent, setClickEvent] = useState(false);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
    const [gestureY, setGestureY] = useState(0);
    const [isSyncingYGesture, setIsSyncingYGesture] = useState(false);
    const [targetY, setTargetY] = useState(0);

    const backgroundInfo = useContext(BackgroundContext);
    const positions = useContext(PositionContext);

    const character = new Character({
        props: props,
        x: { state: [x, setX]},
        y: { state: [y, setY]},
        action: { state: [action, setAction]},
        direction: { state: [direction, setDirection]},
    });

    const backgroundAnimation = new BackgroundAnimation({
        backgroundInfo: backgroundInfo,
        backgroundOffset: backgroundOffset,
        characterProps: props});

    const characterAnimation = new CharacterAnimation({
        character : character,
        backgroundAnimation: backgroundAnimation,
        gestureY : { state: [gestureY, setGestureY]},
        isSyncingYGesture: {state: [isSyncingYGesture, setIsSyncingYGesture]},
        targetY: {state: [targetY, setTargetY]},
        spriteAnimationId: {state: [spriteAnimationId, setSpriteAnimationId]},
        frameIndex: {state : [frameIndex, setFrameIndex]},
        screenHeight: {state : [screenHeight, setScreenHeight]},
        positions: positions});

    const screenOrientationHelper = new ScreenOrientationHelper({
        characterProps: props,
        coordinates: [x, setX, y, setY],
        positions: positions,
        screenHeight: {state: [screenHeight, setScreenHeight]}});


    const HEIGHT_OFFSET = props.characterAnimationConfig[direction][action]['heightOffset'];

    useEffect(() => {
        if (props.defaultPosition && props.bindClicks) {
            throw new Error("Cannot set default position for the main character");
        }

        characterAnimation.recordPosition();
        backgroundAnimation.setBackgroundDirection(RIGHT);

        // Have the non-main character walk across the screen for testing purposes at this point
        if (!props.bindClicks) {
            characterAnimation.animateCharacter(-1*props.spriteWidth,
                CharacterAnimation.getBottomY(props) + props.spriteHeight - props.spriteHeight,
                WALK,
                'left');
        }

        ScreenOrientation.addOrientationChangeListener((event) => {
            screenOrientationHelper.handleScreenOrientationChange();
        });

    },[]);

    const panGesture = Gesture.Pan()
        .onStart((e) => {
            characterAnimation.startSyncYToGesture(e.absoluteX, e.absoluteY);
        })
        .onFinalize((e) => {
            characterAnimation.stopSyncYToGesture(e.absoluteX, e.absoluteY);
        })
        .onTouchesMove((e) => {
            let touches = e.changedTouches[e.numberOfTouches - 1];
            characterAnimation.handleSyncYToGestureChange(touches.absoluteX, touches.absoluteY);
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

            {/* CharacterComponent sprite container */}
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
                {/* CharacterComponent sheep image*/}
                <Image source={props.sheetImage}
                       style={{
                           position: 'absolute',
                           top: -1 * HEIGHT_OFFSET * props.spriteHeight,
                           left: -1 * props.characterAnimationConfig[direction][action]['offsets'][frameIndex] * props.spriteWidth,
                           width: props.sheetWidth,
                           height: props.sheetHeight
                       }}/>
            </Animated.View>
        </View>
        </GestureDetector>);
}

export default CharacterComponent;
