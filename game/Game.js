import Character from "../characters/Character";
import * as ScreenOrientation from 'expo-screen-orientation';
import GameContext from "./game-context";
import CHARACTER_CONFIG from "../characters/character-config";
import {View} from 'react-native';
import React, {useState} from 'react';

const LANDSCAPE_ORIENTATIONS =
    [ScreenOrientation.Orientation.LANDSCAPE_LEFT, ScreenOrientation.Orientation.LANDSCAPE_RIGHT];

const Game = () => {

    ScreenOrientation.addOrientationChangeListener((event) => {
        if (LANDSCAPE_ORIENTATIONS.includes(event.orientationInfo.orientation)) {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).then(e => {});
        }
    });

    function setGameState(gameState) {
        setState({gameState: gameState});
    }

    const [state, setState] = useState({gameState: { positions : {}}, setGameState : setGameState});

    return (
        <GameContext.Provider value={state}>
            <Character id={"monster"}
                       spriteWidth={200}
                       spriteHeight={200}
                       sheetWidth={1600}
                       sheetHeight={3600}
                       sheetImage={require('../assets/sprites/sprite.png')}
                       defaultDirection={"left"}
                       defaultPosition={"right"}
                       bindClicks={false}
                       characterConfig={CHARACTER_CONFIG}/>
            <Character id={"monster2"}
                       spriteWidth={200}
                       spriteHeight={200}
                       sheetWidth={1600}
                       sheetHeight={3600}
                       sheetImage={require('../assets/sprites/sprite.png')}
                       defaultDirection={"left"}
                       defaultPosition={"center"}
                       bindClicks={false}
                       characterConfig={CHARACTER_CONFIG}/>
            {/* Character with bind clicks must be last so it overlaps other characters */}
            <Character id={"barbarian"}
                       spriteWidth={200}
                       spriteHeight={200}
                       sheetWidth={1600}
                       sheetHeight={3600}
                       sheetImage={require('../assets/sprites/sprite.png')}
                       defaultDirection={"right"}
                       defaultPosition={"center"}
                       bindClicks={true}
                       characterConfig={CHARACTER_CONFIG}/>
        </GameContext.Provider>
    );
}

export default Game;
