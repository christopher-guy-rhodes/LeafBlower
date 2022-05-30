import {Animated, Dimensions} from "react-native";
import {WALK} from "../util/constants";
import {CharacterAnimation} from "../animation/CharacterAnimation";

export class ScreenOrientationHelper {

    constructor(builder) {
        this._characterProps = builder.characterProps;
        this._positions = builder.positions;
        this._setScreenHeight = builder.setScreenHeight;
        this._x = builder.x;
        this._setX = builder.setX;
        this._setY = builder.setY;
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

export class ScreenOrientationHelperBuilder {
    constructor(characterProps) {
        this._characterProps = characterProps;
    }

    get characterProps() {
        return this._characterProps;
    }

    get x() {
        return this._x;
    }

    get setX() {
        return this._setX;
    }

    get setY() {
        return this._setY;
    }

    withCoordinates(x, setX, y, setY) {
        this._x = x;
        this._setX = setX;
        this._y = y;
        this._setY = setY;
        return this;
    }

    withPositions(positions) {
        this._positions = positions;
        return this;
    }

    get positions() {
        return this._positions;
    }

    get setScreenHeight() {
        return this._setScreenHeight;
    }

    withScreenHeightState(screenHeight, setScreenHeight) {
        this._screenHeight = screenHeight;
        this._setScreenHeight = setScreenHeight;
        return this;
    }

    build() {
        return new ScreenOrientationHelper(this);
    }
}
