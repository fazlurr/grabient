import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Animate } from 'react-move';
import Wheelpng from './../../wheel.png';

import { updateGradientAngle, toggleEditing, updateEditingAngle } from './../../store/gradients/actions';

import { Arrow, Close } from './../../components/Icons/index';
import { Button } from './../../components/Common/index';
import { TextLG } from './../../components/Common/Typography';

const AreaContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -298px;
`;

const Container = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  background-image: url(${Wheelpng});
  background-size: 220px auto;
  background-repeat: no-repeat;
  background-position: center;
`;

const Background = styled.div`
  height: 100%;
  border-radius: 15px;
  position: absolute;
  width: 100%;
  border: 1px solid #000;
  background-color: #000;
`;

const AngleRef = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  height: 2px;
  width: 2px;
`;

const TextContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: text;

  height: 85px;
  width: 85px;
`;

const TextValue = TextLG.extend`
  color: white;
  display: inline-block;
  text-align: center;
  border: none;
  background: none;
  width: 100%;
  line-height: 29px;

  &::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: none;
  }
`.withComponent('input');

const Degree = TextLG.extend`
  color: white;
  position: absolute;
  top: 23px;
`;

const CloseButton = Button.extend`
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 17;
`;

const ArrowContainer = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 47.8%;
  top: 47.8%;
  cursor: pointer;
`;

const origState = {
  cursorUpdatingAngle: true,
  updatingText: false,
  cursorUpdatingAngleAccurately: false
};
class AngleWheel extends Component {
  state = origState;

  componentWillReceiveProps(nextProps) {
    if (nextProps.editing) {
      setTimeout(() => {
        if (this.input) {
          this.input.focus();
        }
      }, this.props.transitionDuration + 50);
    } else if (!nextProps.editing) {
      this.setState(origState);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.angle !== nextProps.angle) return true;
    if (this.state.cursorUpdatingAngle !== nextState.cursorUpdatingAngle) {
      return true;
    }
    if (this.props.editing !== nextProps.editing) {
      return true;
    }
    return false;
  }

  _handleMouseLeave = () => {
    const { toggleEditing, id } = this.props;
    this.updateActualAngle();
    toggleEditing(id);
    this.setState(() => ({
      cursorUpdatingAngle: false,
      updatingText: false
    }));
  };

  _handleMouseMove = e => {
    const { cursorUpdatingAngle, updatingText, cursorUpdatingAngleAccurately } = this.state;
    const { updateEditingAngle } = this.props;
    if (cursorUpdatingAngle && !updatingText) {
      let angle = this.getAngle(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      if (!cursorUpdatingAngleAccurately) angle = this.checkCommonAngles(angle);
      if (angle === 360) angle = 0;
      updateEditingAngle(angle);
    }
  };

  _handleKeyEnter = e => {
    if (e.which === 13) {
      this.updateActualAngle();
      this.toggleEditing();
      this.setState(origState);
    }
  };

  _handleInputChange = e => {
    let angle = e.target.value;
    if (!isNaN(angle)) {
      if (angle > 359) {
        angle = 0;
        this.input.value = angle;
      }
      if (angle < 0) angle = 360 - Math.abs(angle % 360);
      this._handleInputChange.lastValid = angle;
      this.updateEditingAngle(angle);
    } else {
      this.updateEditingAngle('');
    }
  };

  _handleInputClick = () => {
    this.setState(() => ({ cursorUpdatingAngle: false }));
  };

  _handleClick = e => {
    const { cursorUpdatingAngle } = this.state;

    if (cursorUpdatingAngle) {
      this.updateActualAngle();
      this.toggleEditing();
      this.setState(origState);
    } else {
      this.updateEditingAngle(this.getAngle(e.nativeEvent.offsetX, e.nativeEvent.offsetY));
    }
  };

  _handleArrowClick = () => {
    this.setState(() => ({ cursorUpdatingAngle: true }));
  };

  _handleClose = () => {
    this.toggleEditing(null);
  };

  _handleMouseDown = e => {
    e.preventDefault();
    const { cursorUpdatingAngle } = this.state;
    if (cursorUpdatingAngle) {
      this.setState({
        cursorUpdatingAngleAccurately: true
      });
    }
  };

  _handleTextContainerClick = () => {
    this.input.select();
  };

  toggleEditing() {
    const { id, toggleEditing } = this.props;
    toggleEditing(id);
  }

  updateEditingAngle(angle) {
    const { updateEditingAngle } = this.props;
    updateEditingAngle(angle);
  }

  updateActualAngle() {
    const { updateGradientAngle, id, angle, origAngle } = this.props;
    const newAngle = isNaN(angle) ? origAngle : angle;
    updateGradientAngle(id, newAngle);
  }

  checkCommonAngles(angle) {
    if (angle <= 10 || angle >= 350) return 0;
    else if (angle >= 35 && angle <= 55) return 45;
    else if (angle >= 80 && angle <= 100) return 90;
    else if (angle >= 125 && angle <= 145) return 135;
    else if (angle >= 170 && angle <= 190) return 180;
    else if (angle >= 215 && angle <= 235) return 225;
    else if (angle >= 260 && angle <= 280) return 270;
    else if (angle >= 305 && angle <= 325) return 315;
    return angle;
  }

  getAngle(offsetX, offsetY) {
    const boxCenter = this.getBoxCenter();
    let angle = Math.atan2(offsetX - boxCenter[0], -(offsetY - boxCenter[1])) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return Math.round(angle);
  }

  getBoxCenter() {
    return [this.box.offsetLeft + this.box.offsetWidth / 2, this.box.offsetTop + this.box.offsetHeight / 2];
  }

  getRight(angle) {
    const length = angle.toString().length;

    if (length === 3) return 10;
    else if (length === 2) return 15;
    else return 22;
  }

  render() {
    const { cursorUpdatingAngle } = this.state;
    const { transitionDuration, editing, angle, ...props } = this.props;
    return (
      <Animate
        data={{
          opacity: editing ? 0.1 : 0
        }}
        duration={transitionDuration}
      >
        {data => {
          return (
            editing &&
            <AreaContainer
              {...props}
              style={{
                zIndex: editing ? 15 : 1
              }}
            >
              <Background style={{ opacity: data.opacity }} />

              <Container
                onClick={this._handleClick}
                onMouseDown={this._handleMouseDown}
                onMouseMove={this._handleMouseMove}
                style={{
                  zIndex: cursorUpdatingAngle ? 17 : 15
                }}
              >
                <AngleRef
                  innerRef={node => {
                    this.box = node;
                  }}
                />
              </Container>

              <CloseButton onClick={this._handleClose} title="Exit">
                <Close color="white" size={15} />
              </CloseButton>

              <TextContainer
                onClick={this._handleTextContainerClick}
                style={{
                  zIndex: 17
                }}
              >
                <TextValue
                  className="TextValue"
                  autoFocus
                  innerRef={node => {
                    this.input = node;
                  }}
                  onFocus={e => e.target.select()}
                  onClick={this._handleInputClick}
                  onKeyDown={this._handleKeyEnter}
                  type="number"
                  value={angle}
                  onChange={this._handleInputChange}
                />
                <Degree
                  style={{
                    right: this.getRight(angle)
                  }}
                >
                  °
                </Degree>
              </TextContainer>

              <ArrowContainer
                onClick={this._handleArrowClick}
                style={{
                  transform: `rotate(${angle}deg) translateY(-123px)`,
                  zIndex: cursorUpdatingAngle ? 14 : 16
                }}
              >
                <Arrow />
              </ArrowContainer>
            </AreaContainer>
          );
        }}
      </Animate>
    );
  }
}

export default connect(
  ({ gradients: { editingAngle } }, { id, angle }) => ({
    // eslint-disable-next-line eqeqeq
    editing: id == editingAngle.id,
    angle: !isNaN(editingAngle.angle) ? (editingAngle.angle === null ? angle : editingAngle.angle) : angle,
    origAngle: angle
  }),
  {
    updateGradientAngle,
    toggleEditing,
    updateEditingAngle
  }
)(AngleWheel);
