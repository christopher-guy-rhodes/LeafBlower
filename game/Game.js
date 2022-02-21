import Character from "../characters/Character";
import PositionContext from "./position-context";
import BackgroundContext from "./background-context";
import CHARACTER_CONFIG from "../characters/character-config";
import {View} from 'react-native';
import React, {useState} from 'react';

const Game = () => {

    function setCharacterPositions(positions) {
        setPositions({positions: positions, setCharacterPositions: setCharacterPositions});
    }

    function setBackgroundDetail(backgroundInfo) {
        setBackgroundInfo({backgroundInfo : backgroundInfo, setBackgroundDetail: setBackgroundDetail});
    }

    const [positions, setPositions] =
        useState({positions : {}, setCharacterPositions : setCharacterPositions});
    const [backgroundInfo, setBackgroundInfo] =
        useState({backgroundInfo : {}, setBackgroundDetail : setBackgroundDetail});

    return (
        <BackgroundContext.Provider value={backgroundInfo}>
            <PositionContext.Provider value={positions}>
                <Character id={"monster"}
                           spriteWidth={200}
                           spriteHeight={200}
                           sheetWidth={1600}
                           sheetHeight={3600}
                           sheetImage={require('../assets/sprites/sprite.png')}
                           defaultDirection={"left"}
                           defaultPosition={1500}
                           bindClicks={false}
                           characterConfig={CHARACTER_CONFIG}/>
                {/*
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
                 */}
                {/* Character with bind clicks must be last so it overlaps other characters */}
                <Character id={"barbarian"}
                           spriteWidth={200}
                           spriteHeight={200}
                           sheetWidth={1600}
                           sheetHeight={3600}
                           sheetImage={require('../assets/sprites/sprite.png')}
                           defaultDirection={"right"}
                           bindClicks={true}
                           characterConfig={CHARACTER_CONFIG}/>
            </PositionContext.Provider>
        </BackgroundContext.Provider>
    );
}

export default Game;
