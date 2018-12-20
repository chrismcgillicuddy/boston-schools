import React, { Component } from 'react';
import * as d3 from 'd3';
import Slider from 'rc-slider';

class PriceFilter extends Component {

  newRange = (rangeValues) => {
    this.setState({rangeFrom: rangeValues[0]});
    this.setState({rangeTo: rangeValues[1]});
    // console.log("PROPS",this.props);
    this.props.updateRange(rangeValues);
  }

  render() {
    const {priceRange} = this.props;
    const formatMedian = d3.format(".2s"); // e.g 300k, 2M
    const marks = { // irregular mark placement to align with left and right edges of slider
      258000: '200k',
      1965000: '2M'
    };
    // let fromPrice = formatMedian(this.state.fromRange);
    // let toPrice = formatMedian(this.state.toRange);

    return (
      <div className="price-filter">
        <span className="price-filter-label">Show towns with median home values between <span className="price-range-from">${formatMedian(priceRange[0])}</span> and <span className="price-range-to">${formatMedian(priceRange[1])}</span></span>
        <Slider.Range pushable={100000} allowCross={false} min={200000} max={2000000} step={100000} onChange={this.newRange} marks={marks} defaultValue={[200000, 2000000]} />
      </div>
    );
  }
}

export default PriceFilter;
