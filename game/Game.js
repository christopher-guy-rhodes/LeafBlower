import {React, useState} from 'react';
import { View, Text, Image, ScrollView, TextInput } from 'react-native';
import characterConfig from "../characters/characterConfig";
import Character from "../characters/Character";
import {GameContext} from "./game-context";

const Game = () => {

    function setGameState(gameState) {
        setState({gameState: gameState});
    }

    const [state, setState] = useState(
        {gameState: { positions : {}}, setGameState : setGameState});

    return (
        <GameContext.Provider value={state}>
        <View>
            <Character id={"barbarian"}
                       spriteWidth={400}
                       spriteHeight={400}
                       sheetWidth={3200}
                       sheetHeight={7200}
                       sheetImage={require('../assets/sprites/sprite.png')}
                       defaultDirection={"right"}
                       defaultPosition={"left"}
                       characterConfig={characterConfig}/>
            <Character id={"monster"}
                       spriteWidth={400}
                       spriteHeight={400}
                       sheetWidth={3200}
                       sheetHeight={7200}
                       sheetImage={require('../assets/sprites/sprite.png')}
                       defaultDirection={"left"}
                       defaultPosition={"right"}
                       characterConfig={characterConfig}/>
        </View>
        </GameContext.Provider>
    );
}

export default Game;
