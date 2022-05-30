import {Dimensions} from "react-native";


export class Character {
    constructor(props) {
        this._props = props.props;
        this._x = props.x.state[0];
        this._setX = props.x.state[1];
        this._y = props.y.state[0];
        this._setY = props.y.state[1];
        this._action = props.action.state[0];
        this._setAction = props.action.state[1];
        this._direction = props.direction.state[0];
        this._setDirection = props.direction.state[1];
    }

    get props() {
        return this._props;
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

    get y() {
        return this._y;
    }

    get action() {
        return this._action;
    }

    get setAction() {
        return this._setAction;
    }

    get direction() {
        return this._direction;
    }

    get setDirection() {
        return this._setDirection;
    }

    /**
     * Get the default value of the x coordinate or sets it to the middle of the screen if there is no default set
     *
     * @param props the character properties
     * @returns {number} the default value of x
     */
    static getDefaultX(props) {
        return props.defaultPosition === undefined ? (Dimensions.get('window').width - props.spriteWidth) / 2
            : props.defaultPosition;
    }
}
