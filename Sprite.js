import {React, useEffect, useState} from 'react';
import {Image, Text, Pressable, View} from 'react-native';

const Sprite = (props) => {
    const ATTACK = 'attack';
    const WALK = 'walk';
    const STOP = 'stop';
    const RIGHT = 'right';
    const LEFT = 'left';

    const [frameIndex, setFrameIndex] = useState(0);
    const [animationId, setAnimationId] = useState(0);
    const [action, setAction] = useState(STOP);
    const [clickCount, setClickCount] = useState(0);
    const [clickTimer, setClickTimer] = useState(0);
    const [direction, setDirection] = useState(RIGHT);
    const [offsets, setOffsets] = useState(props.frames[direction][action]['offsets']);

    const heightOffset = props.frames[direction][action]['heightOffset'];

    function animateSprite(newAction){
        let actionConfig = props.frames[direction][newAction];
        setOffsets(actionConfig['offsets']);

        let index = 0;
        let animationId = setInterval(() => {

            if (index > actionConfig['offsets'].length - 1) {
                if (actionConfig['loop'] === false) {
                    return;
                } else {
                    index = 0;
                }
            }

            setFrameIndex(index++);
        }, 1000 / actionConfig['fps']);
        setAnimationId(animationId);
    }

    function handlePress(e, animationId) {
        let newClickCount = clickCount + 1;
        setClickCount(newClickCount);

        console.log('getting click action new click count is ' + newClickCount);
        let newAction = getClickAction(newClickCount);

        if (newAction === STOP) {
            clearInterval(animationId);
            setAction(STOP);
        } else {
            setFrameIndex(0);
            clearInterval(animationId);
            setAction(newAction);
            animateSprite(newAction);
        }
    }

    function getClickAction(clickCount) {
        let newAction = undefined;

        if (clickCount > 1) {
            clearTimeout(clickTimer);
            setClickCount(0);
            newAction = ATTACK;
        } else {
            setClickTimer(setTimeout(() => {
                setClickCount(0)
            }, 1000));

            console.log('action is %s', action);
            if (action === WALK) {
                newAction = STOP;
            } else if (action === STOP) {
                newAction = WALK;
            } else if (action === ATTACK) {
                newAction = WALK;
            }
        }

        return newAction;
    }

    return (
        <Pressable onPress={(e) => handlePress(e, animationId)}>
            <View style={{width: props.width, height: props.height, overflow: 'hidden', border: '1px solid black'}}>

                <Text>x:{frameIndex} ({-1 * offsets[frameIndex] * props.width }) y:{heightOffset * props.height}</Text>
                <Image source={props.image}
                    style={{
                        position: 'absolute',
                        top: -1 * heightOffset * props.height,
                        left: -1 * offsets[frameIndex] * props.width,
                        width: props.sheetWidth,
                        height: props.sheetHeight }} />
            </View>
        </Pressable>
    );
}

export default Sprite;
