import {Animated, Dimensions} from "react-native";
import {WALK} from "../util/constants";
import {CharacterAnimation} from "../animation/CharacterAnimation";

export class ScreenOrientationHelper {

    constructor(props) {
        this._characterProps = props.characterProps;
        this._positions = props.positions;
        this._setScreenHeight = props.screenHeight.state[0];
        this._x = props.coordinates[0];
        this._setX = props.coordinates[1];
        this._setY = props.coordinates[3];
    }

    get characterProps() {
        return this._characterProps;
    }

    get positions() {
        return this._positions;
    }

    get setScreenHeight() {
        return this._setScreenHeight;
    }

    get setX() {
        return this._setX;
    }

    get x() {
        return this._x;
    }

    get setY() {
        return this._setY;
    }

    handleScreenOrientationChange() {
        this.setScreenHeight(Dimensions.get('window').height);

        let barbarianXDelta = this.positions['positions']['barbarian']['x'] + Dimensions.get('window').height - this.characterProps.spriteWidth;
        if (this.characterProps.bindClicks) {
            this.setX(new Animated.Value(Character.getDefaultX(this.characterProps)));
        } else {
            this.x.setOffset(barbarianXDelta);
        }
        this.setY(new Animated.Value(CharacterAnimation.getBottomY(this.characterProps)));
    }
}
