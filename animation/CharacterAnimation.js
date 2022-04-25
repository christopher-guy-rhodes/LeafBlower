import {BACKGROUND_WIDTH_PX, FPS, LEFT, PPS, RIGHT, SCROLLING_ACTIONS, STOP, WALK} from "../util/constants";
import {Animated, Dimensions, Easing} from "react-native";

export class CharacterAnimation {
    constructor(builder) {
        this._character = builder.character;
        this._frameIndex = builder.frameIndex;
        this._setFrameIndex = builder.setFrameIndex;
        this._setCharacterActionAnimationConfig = builder.setCharacterActionAnimationConfig;
        this._setGestureY = builder.setGestureY;
        this._isSyncingYGesture = builder.isSyncingYGesture;
        this._setIsSyncingYGesture = builder.setIsSyncingYGesture;
        this._setTargetY = builder.setTargetY;
        this._targetY = builder.targetY;
        this._pressY = builder.pressY;
        this._backgroundInfo = builder.backgroundInfo;
        this._backgroundOffset = builder.backgroundOffset;
        this._spriteAnimationId = builder.spriteAnimationId;
        this._setSpriteAnimationId = builder.setSpriteAnimationId;
        this._positions = builder.positions;
        this._screenHeight = builder.screenHeight;
        this._setScreenHeight = builder.setScreenHeight;
    }

    get character() {
        return this._character;
    }

    get setGestureY() {
        return this._setGestureY;
    }

    get targetY() {
        return this._targetY;
    }

    get backgroundInfo() {
        return this._backgroundInfo;
    }

    get setFrameIndex() {
        return this._setFrameIndex;
    }

    get setCharacterActionAnimationConfig() {
        return this._setCharacterActionAnimationConfig;
    }

    get backgroundOffset() {
        return this._backgroundOffset;
    }

    get spriteAnimationId() {
        return this._spriteAnimationId;
    }

    get setSpriteAnimationId() {
        return this._setSpriteAnimationId;
    }

    get positions() {
        return this._positions;
    }

    get setTargetY() {
        return this._setTargetY;
    }

    get setIsSyncingYGesture() {
        return this._setIsSyncingYGesture;
    }

    get isSyncingYGesture() {
        return this._isSyncingYGesture;
    }

    get pressY() {
        return this._pressY;
    }

    get targetY() {
        return this._targetY;
    }

    get setScreenHeight() {
        return this._setScreenHeight;
    }

    isHorizontalDirectionChanged(gestureX) {
        return gestureX - this.character.props.spriteWidth / 2 < this.character.x._value && this.character.direction == RIGHT ||
            gestureX - this.character.props.spriteWidth / 2 >= this.character.x._value && this.character.direction === LEFT;
    }

    isVerticalDirectionChanged(gestureY) {
        return gestureY - this.character.props.spriteHeight / 2 < this.character.y._value && gestureY - this.character.props.spriteHeight / 2 >= this.targetY ||
            gestureY - this.character.props.spriteHeight / 2 >= this.character.y._value && gestureY - this.character.props.spriteHeight / 2 <= this.targetY;
    }

    /**
     * Get the default value of the x coordinate based on the direction the character is facing
     *
     * @param props the character properties
     * @returns {number} the default value of x
     */
    static getDefaultX(props) {
        return props.defaultPosition === undefined ? (Dimensions.get('window').width - props.spriteWidth) / 2
            : props.defaultPosition;
    }

    /**
     * Determines of the character is changing direction to the test direction with the new click
     * @param e the click event
     * @param testDir the direction to test
     * @returns {boolean} true if the character is changing direction to testDir, false otherwise.
     */
    isChangingDirectionTo(pageX, pageY, testDir) {
        let xValue = this.character.x._value !== undefined ? this.character.x._value : CharacterAnimation.getDefaultX(this.character.props);
        return testDir === LEFT
            ? this.character.direction === RIGHT && pageX < xValue + this.character.props.spriteWidth / 2
            : this.character.direction === LEFT && pageX >= xValue + this.character.props.spriteWidth / 2;
    }

    /**
     * Set the direction the background is moving. Saves to the parent component state.
     *
     * @param dir the direction the main character is moving
     */
    setBackgroundDirection(dir) {
        if (this.character.props.bindClicks) {

            if (this.backgroundInfo['backgroundInfo'] === undefined) {
                this.backgroundInfo['backgroundInfo'] = {'pps' : 0, 'direction': dir === LEFT ? RIGHT : LEFT};
            }
            this.backgroundInfo['backgroundInfo']['direction'] = dir === LEFT ? RIGHT : LEFT;
            this.backgroundInfo.setBackgroundDetail(this.backgroundInfo.backgroundInfo);
        }
    }

    /**
     * Handles possible direction change. If the character is changing direction the background image loaded needs to be
     * changed to the appropriate copy (left, right or center) so that the edge of the 3 copies of the background images
     * is not shown.
     * @param e the press event
     */
    handleDirectionChange(pageX, pageY) {
        clearInterval(this.spriteAnimationId);
        let dir = this.isChangingDirectionTo(pageX, pageY, LEFT)
            ? LEFT
            : this.isChangingDirectionTo(pageX, pageY, RIGHT) ? RIGHT : this.character.direction;

        this.character.setDirection(dir);

        this.setBackgroundDirection(dir);
    }

    /**
     * Stops the character movement
     */
    stopCharacterMovement() {
        if (this.character.x !== undefined) {
            Animated.timing(this.character.x, {useNativeDriver: false}).stop();
        }
        if (this.character.y != undefined) {
            Animated.timing(this.character.y, {useNativeDriver: false}).stop();
        }

    }

    /**
     * Sets the pixels per second of the background dictated by the pixels per second of the main characters current
     * action. Performs a noop of the character is not the main character (the character with clicks bound).
     *
     * @param dir the direction of the character used to set the default direction
     * @param pps the pixels per second of the character
     */
    setBackgroundPps(dir, pps) {
        if (this.character.props.bindClicks) {
            if (this.backgroundInfo['backgroundInfo'] === undefined) {
                this.backgroundInfo['backgroundInfo'] = {'pps' : 0, 'direction': dir === LEFT ? RIGHT : LEFT};
            }
            this.backgroundInfo['backgroundInfo']['pps'] = pps;
            this.backgroundInfo.setBackgroundDetail(this.backgroundInfo.backgroundInfo);
        }
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
        if (!this.character.props.bindClicks || !SCROLLING_ACTIONS.includes(action)) {
            return;
        }

        let characterActionAnimationConfig = this.character.props.characterAnimationConfig[direction][action];

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

        if (this.character.props.bindClicks) {

            Animated.timing(
                this.backgroundOffset,
                {
                    toValue: toValue,
                    duration: distance / characterActionAnimationConfig[PPS] * 1000,
                    easing: Easing.linear,
                    useNativeDriver: false
                }
            ).start(({ finished }) => {
                console.log('done animating at %s, setting offset to %s', this.backgroundOffset._value, this.getOffsetForDirection(direction));
                clearInterval(this.spriteAnimationId);

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

    /**
     * Records the coordinates for the character to the parent shared state.
     */
    recordPosition() {
        if (this.positions['positions'][this.character.props.id] === undefined) {
            this.positions['positions'][this.character.props.id] = {x : this.character.x._value, y : this.character.y._value};
        }

        this.positions['positions'][this.character.props.id]['x'] = this.character.x._value;
        this.positions['positions'][this.character.props.id]['y'] = this.character.y._value;

        this.positions.setCharacterPositions(this.positions.positions);
    }

    /**
     * Animate a sprite given a character configuration that includes the frame offsets, frames per second and loop
     * configuration. Looks for changes in the background movement to adjust the pixels per second to account for
     * the illusion of movement of the character due to the background motion caused by the main character "moving".
     *
     * @param toX the x coordinate to move to
     * @param toY the y coordinate to move to
     * @param act the action to animate
     * @param dir the direction the character is facing (left or right)
     * @returns {number} the sprite animation id
     */
    animateCharacterSprite(toX, toY, act, dir) {
        let index = 0;
        let characterActionAnimationConfig = this.character.props.characterAnimationConfig[dir][act];
        let timeout = characterActionAnimationConfig[FPS] === 0 ? 0 : 1000 / characterActionAnimationConfig[FPS];
        let initialBackgroundPps = this.backgroundInfo['backgroundInfo'][PPS] === undefined ? 0 : this.backgroundInfo['backgroundInfo'][PPS];
        let animationId = setInterval(() => {

            if (index > characterActionAnimationConfig['offsets'].length - 1) {
                if (characterActionAnimationConfig['loop'] === false) {
                    clearInterval(animationId);
                    return;
                } else {
                    index = 0;
                }
            }
            this.recordPosition();

            if (!this.character.props.bindClicks) {
                let backgroundPps = this.backgroundInfo['backgroundInfo'][PPS] === undefined ? 0 : this.backgroundInfo['backgroundInfo'][PPS];
                if (backgroundPps != initialBackgroundPps) {
                    // If background is moving in the same direction of the character add to the pps, otherwise subtract
                    let adjusted = backgroundPps * (dir !== this.backgroundInfo['backgroundInfo']['direction'] ? -1 : 1);

                    // Stop movement and sprite animation and restart it with the adjusted pps
                    clearInterval(animationId);
                    this.stopCharacterMovement();
                    this.animateCharacter(toX, toY, act, dir, adjusted);
                }
            }

            this.setFrameIndex(index);
            index++;
        }, timeout);
        this.setSpriteAnimationId(animationId);
        return animationId;
    }

    /**
     * Get the y coordinate for the bottom of the screen
     *
     * @props {object} the character props
     * @returns {number} the value of y at the bottom of the screen
     */

    static getBottomY(props) {
        return Dimensions.get('window').height - props.spriteHeight;
    }

    /**
     * Get the distance from the current coordinate of the character to the given coordinate using the pythagorean
     * theorem.
     *
     * @param toX the x coordinate to calculate the distance to
     * @param toY the y coordinate to calculate the distance to
     * @returns {number} the distance
     */
    getDistanceToCoordinate(toX, toY) {
        return Math.sqrt(Math.pow(Math.abs(toX - this.character.x._value), 2) +
            Math.pow(Math.abs(toY - this.character.y._value), 2))
    }

    /**
     * Move the character at pps pixels per second to coordinate toX, toY. Stop the sprite animation identified by
     * animationId when the movement is complete.
     *
     * @param toX the x coordinate to move to
     * @param toY the y coordinate to move to
     * @param animationId the sprite animation id
     * @param pps the pixels per second to move at
     */
    animateCharacterMovement(toX, toY, animationId, pps) {

        if (pps > 0/* && !props.bindClicks*/) {

            if (this.character.props.bindClicks) {
                toX = this.character.x._value;
                toY = Math.min(toY, CharacterAnimation.getBottomY(this.character.props));
                this.setTargetY(toY);
                console.log('animating %s toY: %s', this.character.props.id, toY);
            }

            let duration = pps === 0
                ? 0
                : this.getDistanceToCoordinate(toX, toY) / pps * 1000;

            Animated.parallel([
                    Animated.timing(
                        this.character.x,
                        {
                            toValue: toX,
                            duration: duration,
                            easing: Easing.linear,
                            useNativeDriver: false
                        }),
                    Animated.timing(
                        this.character.y,
                        {
                            toValue: toY,
                            duration: duration,
                            easing: Easing.linear,
                            useNativeDriver : false
                        })

                ]
            ).start(({ finished }) => {
                if (!this.character.props.bindClicks) {
                    clearInterval(animationId);
                }
            });
        }
    }

    /**
     * Animate the movement and sprite frames of the character.
     *
     * @param toX the x coordinate to go to
     * @param toY the y coordinate to go to
     * @param act the action to animate
     * @param dir the direction the character is facing (left or right)
     */
    animateCharacter(toX, toY, act, dir, fpsAdjust = 0){

        this.stopCharacterMovement()
        this.character.setAction(act);
        this.setFrameIndex(0);

        let characterActionAnimationConfig = this.character.props.characterAnimationConfig[dir][act];


        this.setBackgroundPps(dir, characterActionAnimationConfig[PPS]);

        this.animateBackground(act, dir);
        let spriteAnimationId = this.animateCharacterSprite(toX, toY, act, dir);


        this.animateCharacterMovement(toX, toY, spriteAnimationId, characterActionAnimationConfig[PPS] + fpsAdjust);
    }

    startSyncYToGesture(absoluteX, absoluteY) {
        this.setGestureY(absoluteY);
        clearInterval(this.spriteAnimationId);
        this.animateCharacter(absoluteX,absoluteY - this.character.props.spriteHeight / 2, WALK, this.character.direction);
    }

    stopSyncYToGesture(absoluteX, absoluteY) {
        this.setIsSyncingYGesture(false);
        this.setTargetY(this.character.y._value);
        this.setGestureY(this.character.y._value);
        this.setFrameIndex(0);
        clearInterval(this.spriteAnimationId);
        this.animateCharacter(absoluteX, absoluteY, STOP, this.character.direction);
    }

    handleSyncYToGestureChange(absoluteX, absoluteY) {
        if (!this.character.props.bindClicks) {
            return;
        }

        this.setGestureY(absoluteY);

        if (this.isHorizontalDirectionChanged(absoluteX)) {
            clearInterval(this.spriteAnimationId);
            this.handleDirectionChange(absoluteX, absoluteY);
            this.animateCharacter(absoluteX, absoluteY, WALK, this.character.direction === RIGHT ? LEFT : RIGHT);
        }

        if (this.isVerticalDirectionChanged()) {
            this.setIsSyncingYGesture(false);
        }

        if (this.pressY !== this.targetY) {
            this.setTargetY(this.pressY - this.character.props.spriteHeight / 2);
        }

        if (!this.isSyncingYGesture && this.character.y._value !== this.targetY) {
            this.setIsSyncingYGesture(true);

            let characterActionAnimationConfig = this.character.props.characterAnimationConfig[this.character.direction][this.character.action];
            Animated.timing(this.character.y, {
                toValue : this.targetY,
                duration : Math.abs(this.character.y._value - this.targetY) / characterActionAnimationConfig[PPS] * 1000,
                easing: Easing.linear,
                useNativeDriver: false
            }).start((successful) => {
                this.setIsSyncingYGesture(false);
            });
        }
    }
}

export class CharacterAnimationBuilder {
    constructor(character) {
        this._character = character;
    }

    get character() {
        return this._character;
    }

    get setGestureY() {
        return this._setGestureY;
    }

    get gestureY() {
        return this._gestureY;
    }

    withGestureYState(gestureY, setGestureY) {
        this._gestureY = gestureY;
        this._setGestureY = setGestureY;
        return this;
    }

    get isSyncingYGesture() {
        return this._isSyncingYGesture;
    }

    get setIsSyncingYGesture() {
        return this._setIsSyncingYGesture;
    }

    withIsSyncingYGestureState(isSyncingYGesture, setIsSyncingYGesture) {
        this._isSyncingYGesture = isSyncingYGesture;
        this._setIsSyncingYGesture = setIsSyncingYGesture;
        return this;
    }

    get setTargetY() {
        return this._setTargetY;
    }

    get targetY() {
        return this._targetY;
    }

    withTargetYState(targetY, setTargetY) {
        this._targetY = targetY;
        this._setTargetY = setTargetY;
        return this;
    }

    get spriteAnimationId() {
        return this._spriteAnimationId;
    }

    get setSpriteAnimationId() {
        return this._setSpriteAnimationId;
    }

    withSpriteAnimationIdState(spriteAnimationId, setSpriteAnimationId) {
        this._spriteAnimationId = spriteAnimationId;
        this._setSpriteAnimationId = setSpriteAnimationId;
        return this;
    }

    get frameIndex() {
        return this._frameIndex;
    }

    get setFrameIndex() {
        return this._setFrameIndex;
    }

    withFrameIndexState(frameIndex, setFrameIndex) {
        this._frameIndex = frameIndex;
        this._setFrameIndex = setFrameIndex;
        return this;
    }

    get setCharacterActionAnimationConfig() {
        return this._setCharacterActionAnimationConfig;
    }

    get screenHeight() {
        return this._screenHeight;
    }

    get setScreenHeight() {
        return this._setScreenHeight;
    }

    withScreenHeightState(screenHeight, setScreenHeight) {
        this._screenHeight = screenHeight;
        this._setScreenHeight = setScreenHeight;
        return this;
    }


    get pressY() {
        return this._gestureY;
    }


    get backgroundInfo() {
        return this._backgroundInfo;
    }

    withBackgroundInfo(backgroundInfo) {
        this._backgroundInfo = backgroundInfo;
        return this;
    }

    get backgroundOffset() {
        return this._backgroundOffset;
    }

    get positions() {
        return this._positions;
    }

    withBackgroundOffset(backgroundOffset) {
        this._backgroundOffset = backgroundOffset;
        return this;
    }

    withPositions(positions) {
        this._positions = positions;
        return this;
    }

    build() {
        return new CharacterAnimation(this);
    }
}
