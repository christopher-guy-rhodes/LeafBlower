import {BACKGROUND_WIDTH_PX, LEFT, PPS, RIGHT, SCROLLING_ACTIONS} from "../util/constants";
import {Animated, Easing} from "react-native";

export class BackgroundAnimation {
    constructor(props) {
        this._backgroundInfo = props.backgroundInfo;
        this._backgroundOffset = props.backgroundOffset;
        this._characterProps = props.characterProps;
    }

    get backgroundInfo() {
        return this._backgroundInfo;
    }

    get backgroundOffset() {
        return this._backgroundOffset;
    }

    get characterProps() {
        return this._characterProps;
    }

    /**
     * Set the direction the background is moving. Saves to the parent component state.
     *
     * @param dir the direction the main character is moving
     */
    setBackgroundDirection(dir) {
        if (this.backgroundInfo['backgroundInfo'] === undefined) {
            this.backgroundInfo['backgroundInfo'] = {'pps' : 0, 'direction': dir === LEFT ? RIGHT : LEFT};
        }
        this.backgroundInfo['backgroundInfo']['direction'] = dir === LEFT ? RIGHT : LEFT;
        this.backgroundInfo.setBackgroundDetail(this.backgroundInfo.backgroundInfo);
    }

    /**
     * Sets the pixels per second of the background dictated by the pixels per second of the main characters current
     * action. Performs a noop of the character is not the main character (the character with clicks bound).
     *
     * @param dir the direction of the character used to set the default direction
     * @param pps the pixels per second of the character
     */
    setBackgroundPps(dir, pps) {
        if (this.backgroundInfo['backgroundInfo'] === undefined) {
            this.backgroundInfo['backgroundInfo'] = {'pps' : 0, 'direction': dir === LEFT ? RIGHT : LEFT};
        }
        this.backgroundInfo['backgroundInfo']['pps'] = pps;
        this.backgroundInfo.setBackgroundDetail(this.backgroundInfo.backgroundInfo);
    }

    /**
     * Stops the background animation.
     */
    stopBackgroundAnimation() {
        this.backgroundOffset.setValue(this.backgroundOffset._value);
    }

    /**
     * In order to support looped background scrolling there are three copies of the background image (left, center and
     * right). If the character has moved right of the center of the background and is facing right the left background
     * image copy is loaded so that when the character advances right the edge of the screen is not shown (instead the
     * center copy is advanced into). Similarly if the character has moved left of center and is facing left the right
     * background image copy is used. If neither of these conditions are met the character can move without the risk
     * of the edge of the three images being visible.
     *
     * @param direction the direction the character is moving
     * @returns {number} the new offset based on the character's direction and the current backround position.
     */
    getOffsetForDirection(direction) {

        if (direction === RIGHT && this.backgroundOffset._value < -1*BACKGROUND_WIDTH_PX) {
            return this.backgroundOffset._value + BACKGROUND_WIDTH_PX;
        } else if (direction === LEFT && this.backgroundOffset._value > -1*BACKGROUND_WIDTH_PX) {
            return this.backgroundOffset._value - BACKGROUND_WIDTH_PX;
        } else {
            return this.backgroundOffset._value;
        }
    }

    /**
     * Animate the background to give the illusion that the character is moving horizontally.
     *
     * @param action the action the character is currently performing
     * @param direction the direction the character is currently pointing
     */
    animateBackground(action, direction) {

        this.stopBackgroundAnimation();
        if (!this.characterProps.bindClicks || !SCROLLING_ACTIONS.includes(action)) {
            return;
        }

        let characterActionAnimationConfig = this.characterProps.characterAnimationConfig[direction][action];

        let toValue = 0;
        let distance = 0;
        if (direction === RIGHT) {
            //console.log('moving right from value %s to value is %s', backgroundOffset._value, -2668);
            toValue = this.backgroundOffset._value - BACKGROUND_WIDTH_PX;
            toValue = -2668;
            distance = Math.abs(this.backgroundOffset._value - toValue);
        } else {
            //console.log('moving left from value %s and to value is %s', backgroundOffset._value, 0);
            toValue = this.backgroundOffset._value + BACKGROUND_WIDTH_PX;
            toValue = 0;
            distance = Math.abs(this.backgroundOffset._value - toValue);
        }

        if (this.characterProps.bindClicks) {

            Animated.timing(
                this.backgroundOffset,
                {
                    toValue: toValue,
                    duration: distance / characterActionAnimationConfig[PPS] * 1000,
                    easing: Easing.linear,
                    useNativeDriver: false
                }
            ).start(({ finished }) => {
                //clearInterval(this.spriteAnimationId);

                console.log('background animation done was it finished? %s', finished);

                if (finished) {
                    if (direction === RIGHT) {
                        this.backgroundOffset.setValue(-1*BACKGROUND_WIDTH_PX);
                        this.animateBackground(action, direction);
                    } else {
                        //backgroundOffset.setValue()
                        this.backgroundOffset.setValue(-1*BACKGROUND_WIDTH_PX);
                        this.animateBackground(action, direction);
                    }
                }
            });
        }

    }
}
