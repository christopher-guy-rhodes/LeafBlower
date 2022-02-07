import {React, useState} from 'react';
import { View, Text, Image, ScrollView, TextInput } from 'react-native';
import frames from "./frames";
import Sprite from "./Sprite";
import {GameContext, themes} from "./game-context";

const Game = () => {

    function setTheme(theme) {
        setState({theme: theme});
    }

    const [state, setState] = useState({theme: themes.light, setTheme : setTheme});

    return (
        <GameContext.Provider value={state}>
        <View>
            <Sprite id={"barbarian"}
                    spriteWidth={400}
                    spriteHeight={400}
                    sheetWidth={3200}
                    sheetHeight={7200}
                    sheetImage={require('./assets/sprite.png')}
                    defaultDirection={"left"}
                    defaultPosition={"right"}
                    frames={frames}/>
            <Sprite id={"monster"}
                    spriteWidth={400}
                    spriteHeight={400}
                    sheetWidth={3200}
                    sheetHeight={7200}
                    sheetImage={require('./assets/sprite.png')}
                    defaultDirection={"right"}
                    defaultPosition={"left"}
                    frames={frames}/>
        </View>
        </GameContext.Provider>
    );
}

export default Game;
