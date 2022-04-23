import {BACKGROUND_WIDTH_PX, FPS, LEFT, PPS, RIGHT, SCROLLING_ACTIONS, WALK} from "../util/constants";
import {Animated, Dimensions, Easing} from "react-native";

export class CharacterAnimation {
    constructor(builder) {
        this._frameIndex = builder.frameIndex;
        this._setFrameIndex = builder.setFrameIndex;
        this._action = builder.action;
        this._setAction = builder.setAction;
        this._characterConfig = builder.characterConfig;
        this._setCharacterConfig = builder.setCharacterConfig;
        this._characterProps = builder.characterProps;
        this._direction = builder.direction;
        this._setDirection = builder.setDirection;
        this._setGestureY = builder.setGestureY;
        this._syncingY = builder.syncingY;
        this._setSyncingY = builder.setSyncingY;
        this._setTargetY = builder.setTargetY;
        this._targetY = builder.targetY;
        this._y = builder.y;
        this._x = builder.x;
        this._pressY = builder.pressY;
        this._pps = builder.pps;
        this._backgroundInfo = builder.backgroundInfo;
        this._backgroundOffset = builder.backgroundOffset;
        this._spriteAnimationId = builder.spriteAnimationId;
        this._setSpriteAnimationId = builder.setSpriteAnimationId;
        this._positions = builder.positions;
    }

    get characterProps() {
        return this._characterProps;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get direction() {
        return this._direction;
    }

    get setDirection() {
        return this._setDirection;
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

    get setAction() {
        return this._setAction;
    }

    get setFrameIndex() {
        return this._setFrameIndex;
    }

    get setCharacterConfig() {
        return this._setCharacterConfig;
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

    get setSyncingY() {
        return this._setSyncingY;
    }

    get syncingY() {
        return this._syncingY;
    }

    get pressY() {
        return this._pressY;
    }

    get targetY() {
        return this._targetY;
    }

    get characterConfig() {
        return this._characterConfig;
    }

    get pps() {
        return this._pps;
    }

    changedHorizontalDirection(pressX) {
        return pressX - this.characterProps.spriteWidth / 2 < this.x._value && this.direction == RIGHT ||
            pressX - this.characterProps.spriteWidth / 2 >= this.x._value && this.direction === LEFT;
    }

    changedVerticalDirection(pressY) {
        return pressY - this.characterProps.spriteHeight / 2 < this.y._value && pressY - this.characterProps.spriteHeight / 2 >= this.targetY ||
            pressY - this.characterProps.spriteHeight / 2 >= this.y._value && pressY - this.characterProps.spriteHeight / 2 <= this.targetY;
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
        let xValue = this.x._value !== undefined ? this.x._value : CharacterAnimation.getDefaultX(this.characterProps);
        return testDir === LEFT
            ? this.direction === RIGHT && pageX < xValue + this.characterProps.spriteWidth / 2
            : this.direction === LEFT && pageX >= xValue + this.characterProps.spriteWidth / 2;
    }

    /**
     * Set the direction the background is moving. Saves to the parent component state.
     *
     * @param dir the direction the main character is moving
     */
    setBackgroundDirection(dir) {
        if (this.characterProps.bindClicks) {

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
        let dir = this.isChangingDirectionTo(pageX, pageY, LEFT)
            ? LEFT
            : this.isChangingDirectionTo(pageX, pageY, RIGHT) ? RIGHT : this.direction;

        this.setDirection(dir);

        this.setBackgroundDirection(dir);
    }

    /**
     * Stops the character movement
     */
    stopCharacterMovement() {
        if (this.x !== undefined) {
            Animated.timing(this.x, {useNativeDriver: false}).stop();
        }
        if (this.y != undefined) {
            Animated.timing(this.y, {useNativeDriver: false}).stop();
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
        if (this.characterProps.bindClicks) {
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
        //Animated.timing(backgroundOffset, {useNativeDriver: false}).stop();
        console.log('==> background offset %o', this.backgroundOffset);
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

        let characterConfig = this.characterProps.characterConfig[direction][action];

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
                    duration: distance / characterConfig[PPS] * 1000,
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
        if (this.positions['positions'][this.characterProps.id] === undefined) {
            this.positions['positions'][this.characterProps.id] = {x : this.x._value, y : this.y._value};
        }

        this.positions['positions'][this.characterProps.id]['x'] = this.x._value;
        this.positions['positions'][this.characterProps.id]['y'] = this.y._value;

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
     * @param characterConfig the character configuration
     * @returns {number} the sprite animation id
     */
    animateCharacterSprite(toX, toY, act, dir, characterConfig) {
        let index = 0;
        let timeout = characterConfig[FPS] === 0 ? 0 : 1000 / characterConfig[FPS];
        let initialBackgroundPps = this.backgroundInfo['backgroundInfo'][PPS] === undefined ? 0 : this.backgroundInfo['backgroundInfo'][PPS];
        let animationId = setInterval(() => {

            if (index > characterConfig['offsets'].length - 1) {
                if (characterConfig['loop'] === false) {
                    clearInterval(animationId);
                    return;
                } else {
                    index = 0;
                }
            }
            this.recordPosition();

            if (!this.characterProps.bindClicks) {
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
        console.log('==> setting sprite animation id to %s', animationId);
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
        return Math.sqrt(Math.pow(Math.abs(toX - this.x._value), 2) +
            Math.pow(Math.abs(toY - this.y._value), 2))
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

            if (this.characterProps.bindClicks) {
                toX = this.x._value;
                toY = Math.min(toY, CharacterAnimation.getBottomY(this.characterProps));
                this.setTargetY(toY);
                console.log('animating %s toY: %s', this.characterProps.id, toY);
            }

            let duration = pps === 0
                ? 0
                : this.getDistanceToCoordinate(toX, toY) / pps * 1000;

            Animated.parallel([
                    Animated.timing(
                        this.x,
                        {
                            toValue: toX,
                            duration: duration,
                            easing: Easing.linear,
                            useNativeDriver: false
                        }),
                    Animated.timing(
                        this.y,
                        {
                            toValue: toY,
                            duration: duration,
                            easing: Easing.linear,
                            useNativeDriver : false
                        })

                ]
            ).start(({ finished }) => {
                if (!this.characterProps.bindClicks) {
                    console.log('==> stop animation id %s', animationId);
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
        this.setAction(act);
        this.setFrameIndex(0);

        let characterConfig = this.characterProps.characterConfig[dir][act];
        this.setBackgroundPps(dir, characterConfig[PPS]);
        this.setCharacterConfig(characterConfig);

        this.animateBackground(act, dir);
        let spriteAnimationId = this.animateCharacterSprite(toX, toY, act, dir, characterConfig);


        //if (!props.bindClicks) {
        this.animateCharacterMovement(toX, toY, spriteAnimationId, characterConfig[PPS] + fpsAdjust);
        //}
    }

    syncYToGesture(absoluteX, absoluteY) {
        if (!this.characterProps.bindClicks) {
            return;
        }



        this.setGestureY(absoluteY);

        if (this.changedHorizontalDirection(absoluteX)) {
            clearInterval(this.spriteAnimationId);
            this.handleDirectionChange(absoluteX, absoluteY);
            this.animateCharacter(absoluteX, absoluteY, WALK, this.direction === RIGHT ? LEFT : RIGHT);
        }

        if (this.changedVerticalDirection()) {
            this.setSyncingY(false);
        }

        if (this.pressY !== this.targetY) {
            this.setTargetY(this.pressY - this.characterProps.spriteHeight / 2);
        }

        if (!this.syncingY && this.y._value !== this.targetY) {
            this.setSyncingY(true);

            Animated.timing(this.y, {
                toValue : this.targetY,
                duration : Math.abs(this.y._value - this.targetY) / this.characterConfig[this.pps] * 1000,
                easing: Easing.linear,
                useNativeDriver: false
            }).start((successful) => {
                this.setSyncingY(false);
            });
        }
    }
}

export class CharacterAnimationBuilder {
    constructor(characterConfig, characterProps) {
        this._characterConfig = characterConfig;
        this._characterProps = characterProps;
    }

    get frameIndex() {
        return this._frameIndex;
    }

    withFrameIndex(frameIndex) {
        this._frameIndex = frameIndex;
        return this;
    }

    get setFrameIndex() {
        return this._setFrameIndex;
    }

    withSetFrameIndex(frameIndex) {
        this._setFrameIndex = frameIndex;
        return this;
    }

    get action() {
        return this._action;
    }

    withAction(action) {
        this._action = action;
        return this;
    }

    get setAction() {
        return this._setAction;
    }

    withSetAction(setAction) {
        this._setAction = setAction;
        return this;
    }

    get characterConfig() {
        return this._characterConfig;
    }

    withCharacterConfig(characterConfig) {
        this._characterConfig = characterConfig;
        return this;
    }

    get setCharacterConfig() {
        return this._setCharacterConfig;
    }

    withSetCharacterConfig(setCharacterConfig) {
        this._setCharacterConfig = setCharacterConfig;
        return this;
    }

    get characterProps() {
        return this._characterProps;
    }

    get setDirection() {
        return this._setDirection;
    }

    withSetDirection(setDirection) {
        this._setDirection = setDirection;
        return this;
    }

    get direction() {
        return this._direction;
    }

    withDirection(direction) {
        this._direction = direction;
        return this;
    }

    get setGestureY() {
        return this._setGestureY;
    }

    withSetGestureY(setGestureY) {
        this._setGestureY = setGestureY;
        return this;
    }

    get syncingY() {
        return this._syncingY;
    }

    withSyncingY(syncingY) {
        this._syncingY = syncingY;
        return this;
    }

    get setSyncingY() {
        return this._setSyncingY;
    }

    withSetSyncingY(setSyncingY) {
        this._setSyncingY = setSyncingY;
        return this;
    }

    get setTargetY() {
        return this._setTargetY;
    }

    withSetTargetY(setTargetY) {
        this._setTargetY = setTargetY;
        return this;
    }

    get targetY() {
        return this._targetY;
    }

    withTargetY(targetY) {
        this._targetY = targetY;
        return this;
    }

    get x() {
        return this._x;
    }

    withX(x) {
        this._x = x;
        return this;
    }

    get y() {
        return this._y;
    }

    withY(y) {
        this._y = y;
        return this;
    }

    get pressY() {
        return this._pressY;
    }

    withPressY(pressY) {
        this._pressY = pressY;
        return this;
    }

    get pps() {
        return this._pps;
    }

    withPps(pps) {
        this._pps = pps;
        return this;
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

    withBackgroundOffset(backgroundOffset) {
        this._backgroundOffset = backgroundOffset;
        return this;
    }

    get spriteAnimationId() {
        return this._spriteAnimationId;
    }

    withSpriteAnimationId(spriteAnimationId) {
        this._spriteAnimationId = spriteAnimationId;
        return this;
    }

    get setSpriteAnimationId() {
        return this._setSpriteAnimationId;
    }

    withSetSpriteAnimationId(setSpriteAnimationId) {
        this._setSpriteAnimationId = setSpriteAnimationId;
        return this;
    }

    get positions() {
        return this._positions;
    }

    withPositions(positions) {
        this._positions = positions;
        return this;
    }

    build() {
        return new CharacterAnimation(this);
    }
}
