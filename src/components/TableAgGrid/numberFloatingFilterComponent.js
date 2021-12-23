import React, { Component, createRef } from 'react';
import { Input} from 'antd'

let data = {
  value: ''
}

class NumberFloatingFilterComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentValue: null,
    };

    this.inputRef = createRef();
  }

  onParentModelChanged(parentModel) {
    console.log(parentModel);
    // When the filter is empty we will receive a null value here
    if (!parentModel) {
      this.setState(
        { currentValue: null },
        () => (this.inputRef.current.value = this.state.currentValue)
      );
    } else {
      this.setState(
        { currentValue: parentModel },
        () => (this.inputRef.current.value = this.state.currentValue)
      );
    }
  }

  onInputBoxChanged = (event) => {
    this.setState({ currentValue: event.target.value });
    data.value = event.target.value
    
  };

  render() {
    console.log(data,223)
    return (
        <Input
          ref={this.inputRef}
          type="number"
          min="0"
          onChange={this.onInputBoxChanged}
          value={data.value}
          onBlur= {()=>this.props.api.refreshHeader()}
        />
    );
  }
}


export default (props) => {
  
  return <NumberFloatingFilterComponent {...props} ></NumberFloatingFilterComponent>
}