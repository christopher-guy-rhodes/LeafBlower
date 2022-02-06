import React from 'react';
import { View, Text, Image, ScrollView, TextInput } from 'react-native';
import Sprite from "./Sprite";

const frames = {right : {
        walk : {
            offsets      : [1, 2, 3, 4, 5, 6],
            fps          : 7,
            pps          : 150,
            heightOffset : 0,
            loop         : true},
        attack : {
            offsets      : [0, 1, 2, 3, 4, 5, 6, 7],
            fps          : 7,
            heightOffset : 4,
            loop         : false},
        stop : {
            offsets      : [0],
            fps          : 0,
            heightOffset : 0,
            loop         : false},
        run : {
            offsets      : [0, 1, 2, 3, 4, 5],
            fps          : 12,
            pps          : 500,
            heightOffset : 2,
            loop         : true}
    },
    left : {
        walk : {
            offsets      : [5, 4, 3, 2, 1, 0],
            fps          : 7,
            pps          : 150,
            heightOffset : 1,
            loop         : true},
        attack : {
            offsets      : [7, 6, 5, 4, 3, 2, 1, 0],
            fps          : 7,
            heightOffset : 5,
            loop         : false},
        stop : {
            offsets      : [6],
            fps          : 0,
            heightOffset : 1,
            loop         : false},
        run : {
            offsets      : [5, 4, 3, 2, 1, 0],
            fps          : 12,
            pps          : 500,
            heightOffset : 3,
            loop         : true}
    }};

const App = () => {

        return (
            <View>
                <Sprite spriteWidth={400}
                        spriteHeight={400}
                        sheetWidth={3200}
                        sheetHeight={7200}
                        sheetImage={require('./assets/sprite.png')}
                        defaultDirection={"right"}
                        defaultPosition={"left"}
                        frames={frames}
                />
                <Sprite spriteWidth={400}
                        spriteHeight={400}
                        sheetWidth={3200}
                        sheetHeight={7200}
                        sheetImage={require('./assets/sprite.png')}
                        defaultDirection={"left"}
                        defaultPosition={"right"}
                        frames={frames}
                />
            </View>
        );
}

export default App;
