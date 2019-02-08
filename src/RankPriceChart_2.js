// https://swizec.com/blog/declarative-d3-charts-react-16-3/swizec/8353

import React, { Component } from 'react';
import * as d3 from 'd3';

const settings = {
  width: 500,
  height: 300,
  padding: 30,
  numDataPoints: 148
};

class DataCircles extends React.Component {
  renderCircle(coords) {
    return (
      <circle
       cx={this.props.xScale(coords.properties["median_price_2017"])}
       cy={this.props.yScale(coords.properties["rank-2018"])}
       r={5}
       key={Math.random() * 1}
      />
    );
  }

  render() {
    return <g>{this.props.data.map(this.renderCircle.bind(this))}</g>
  }
}

class ScatterPlot extends React.Component {
  getXScale() {
    // console.log("data",this.props.data);
    const xMin = d3.min(this.props.data.map(function(d){return parseInt(d.properties["median_price_2017"]);}));
    const xMax = d3.max(this.props.data.map(function(d){return parseInt(d.properties["median_price_2017"]);}));

    return d3.scaleLinear()
      .domain([xMin, xMax])
      .range([this.props.padding, (this.props.width - (this.props.padding * 2))]);
  }

  getYScale() {
    const yMax = d3.max(this.props.data.map(function(d){return parseInt(d.properties["rank-2018"]);}));

    return d3.scaleLinear()
      .domain([yMax, 1])
      .range([this.props.height - this.props.padding, this.props.padding]);
  }

  render() {
    const xScale = this.getXScale();
    const yScale = this.getYScale();

    console.log("xScale(200000)", xScale(200000));
    console.log("xScale(1000000)", xScale(1000000));
    console.log("xScale(1900000)", xScale(1900000));

    return (
      <svg className="rank-price-chart" width={this.props.width} height={this.props.height}>
        <DataCircles xScale={xScale} yScale={yScale} {...this.props} />
      </svg>
    );
  }
}

class RankPriceChart extends Component {
  render() {
    const {
      highlightedTown,
      priceRange,
      data} = this.props;

    const rankedTowns = data.filter(function(d){
        return (Number(d.properties["rank-2018"]) > 0);
      }, this);

    return (
      <ScatterPlot data={rankedTowns} {...settings} />
    );
  }
}

 export default RankPriceChart;
