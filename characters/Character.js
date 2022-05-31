import {Dimensions} from "react-native";


export class Character {
    constructor(props) {
        this.props = props.props;
        this.x = props.x.state[0];
        this.setX = props.x.state[1];
        this.y = props.y.state[0];
        this.setY = props.y.state[1];
        this.action = props.action.state[0];
        this.setAction = props.action.state[1];
        this.direction = props.direction.state[0];
        this.setDirection = props.direction.state[1];
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
