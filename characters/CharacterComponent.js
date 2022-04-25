import { React, useContext, useEffect, useState } from 'react';
import { Animated, Dimensions, Easing, Image, Pressable, Text, View } from 'react-native';
import { PositionContext } from "../game/position-context";
import { BACKGROUND_WIDTH_PX, BACKGROUND_HEIGHT_PX, RIGHT, STOP, WALK } from "../util/constants";
import backgroundImage from "../assets/backgrounds/scrolling-desert.png";
import * as ScreenOrientation from 'expo-screen-orientation';
import { BackgroundContext } from "../game/background-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { CharacterAnimation, CharacterAnimationBuilder } from "../animation/CharacterAnimation";
import {ScreenOrientationHelperBuilder} from "../screen/ScreenOrientationHelper";
import {CharacterBuilder as ChracterBuilder} from "./Character";

const LANDSCAPE_ORIENTATIONS =
    [ScreenOrientation.Orientation.LANDSCAPE_LEFT, ScreenOrientation.Orientation.LANDSCAPE_RIGHT];

const CharacterComponent = (props) => {
    const [frameIndex, setFrameIndex] = useState(0);
    const [spriteAnimationId, setSpriteAnimationId] = useState(0);
    const [action, setAction] = useState(STOP);
    const [direction, setDirection] = useState(props.defaultDirection);
    const [x, setX] = useState(new Animated.Value(CharacterAnimation.getDefaultX(props)));
    const [y, setY] = useState(new Animated.Value(CharacterAnimation.getBottomY(props)));
    const [backgroundOffset] = useState(new Animated.Value(-1334));
    const [clickEvent, setClickEvent] = useState(false);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
    const [gestureY, setGestureY] = useState(0);
    const [syncingY, setSyncingY] = useState(false);
    const [targetY, setTargetY] = useState(0);

    const backgroundInfo = useContext(BackgroundContext);
    const positions = useContext(PositionContext);

    const character = new ChracterBuilder(props)
        .withCoordinates(x, setX, y, setY)
        .withActionState(action, setAction)
        .withDirectionState(direction, setDirection).build();

    const characterAnimation = new CharacterAnimationBuilder(character)
        .withGestureYState(gestureY, setGestureY)
        .withSyncingYState(syncingY, setSyncingY)
        .withTargetYState(targetY, setTargetY)
        .withSpriteAnimationIdState(spriteAnimationId, setSpriteAnimationId)
        .withFrameIndexState(frameIndex, setFrameIndex)
        .withScreenHeightState(screenHeight, setScreenHeight)
        .withBackgroundInfo(backgroundInfo)
        .withBackgroundOffset(backgroundOffset)
        .withPositions(positions).build();

    const screenOrientationHelper = new ScreenOrientationHelperBuilder(props)
        .withCoordinates(x, setX, y, setY)
        .withPositions(positions)
        .withScreenHeightState(screenHeight, setScreenHeight).build();


    const HEIGHT_OFFSET = props.characterAnimationConfig[direction][action]['heightOffset'];

    useEffect(() => {
        if (props.defaultPosition && props.bindClicks) {
            throw new Error("Cannot set default position for the main character");
        }

        characterAnimation.recordPosition();

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
        .onBegin((e) => {
            characterAnimation.handleDirectionChange(e.absoluteX, e.absoluteY);
        })
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
