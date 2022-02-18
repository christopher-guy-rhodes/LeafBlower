import {React, useState} from 'react';
import { View, Text, Image, ScrollView, TextInput } from 'react-native';
import {CHARACTER_CONFIG} from "../characters/character-config";
import Character from "../characters/Character";
import {GameContext} from "./game-context";
import * as ScreenOrientation from 'expo-screen-orientation'

const Game = () => {

    //const [orientationIsLandscape,setOrientation]=useState(true)

    //ScreenOrientation.getOrientationAsync().then(function(res) {console.log('orientation %s', res)});
    //ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    ScreenOrientation.addOrientationChangeListener( (event) => {
            console.log("orientation changed to %o is it %s or %s", event.orientationInfo.orientation, ScreenOrientation.Orientation.LANDSCAPE_LEFT, ScreenOrientation.Orientation.LANDSCAPE_RIGHT);
            if (event.orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || event.orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT) {
                console.log('yes');
                ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

            }
        }
    );

    function setGameState(gameState) {
        setState({gameState: gameState});
    }

    const [state, setState] = useState(
        {gameState: { positions : {}}, setGameState : setGameState});

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
