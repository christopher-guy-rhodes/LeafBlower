import React from 'react';
import { View, Text, Image, ScrollView, TextInput } from 'react-native';
import Sprite from "./Sprite";



const App = () => {

        return (
            <View>

                <Sprite width={400}
                        height={400}
                        sheetWidth={3200}
                        sheetHeight={7200}
                        image={require('./assets/sprite.png')}
                        frames={
                            {right : {
                                walk   : {
                                    offsets      : [1, 2, 3, 4, 5, 6],
                                    fps          : 7,
                                    pps          : 150,
                                    heightOffset : 0,
                                    loop         : true},
                                attack : {offsets : [0, 1, 2, 3, 4, 5, 6, 7], fps : 7,  heightOffset: 4, loop : false},
                                stop   : {offsets : [0],                      fps : 0,  heightOffset: 0, loop : false},
                                run    : {
                                    offsets      : [0, 1, 2, 3, 4, 5],
                                    fps          :  12,
                                    pps          : 500,
                                    heightOffset : 2,
                                    loop : true}
                                }}}
                />
            </View>
        );
}

export default App;
