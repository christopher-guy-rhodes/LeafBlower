export class Character {
    constructor(builder) {
        this._props = builder.characterProps;
        this._x = builder.x;
        this._setX = builder.setX;
        this._y = builder.y;
        this._setY = builder.setY;
        this._action = builder.action;
        this._setAction = builder.setAction;
        this._direction = builder.direction;
        this._setDirection = builder.setDirection;
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
}

export class CharacterBuilder {

    constructor(props) {
        this._characterProps = props;
    }

    get characterProps() {
        return this._characterProps;
    }

    get action() {
        return this._action;
    }

    get setAction() {
        return this._setAction;
    }

    withActionState(action, setAction) {
        this._action = action;
        this._setAction = setAction;
        return this;
    }

    get direction() {
        return this._direction;
    }

    get setDirection() {
        return this._setDirection;
    }

    withDirectionState(direction, setDirection) {
        this._direction = direction;
        this._setDirection = setDirection;
        return this;
    }

    get x() {
        return this._x;
    }

    get setX() {
        return this._setX;
    }

    get y() {
        return this._y;
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

    build() {
        return new Character(this);
    }
}
