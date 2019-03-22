// chart reference: https://codepen.io/greg5green/pen/epLKMp
import React, { Component } from 'react';
import * as d3 from 'd3';

const settings = {
  margin: {top: 10, right: 15, bottom: 40, left: 10},
  width: 625,
  height: 275
};

// used for converting town names from ALL CAPS
const makeTitleCase = function(str) {
  // http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript/196991#196991
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

const townNameLabel = d3.select("body")
  .append("div")
  .attr("class", "tooltip chart-tooltip")
  .style("opacity", 0);

const showTooltip = function(e, townName) {
  townNameLabel.transition()
    .duration(100)
    .style("opacity", 1);
  townNameLabel.html(makeTitleCase(townName))
    .style("left", (e.screenX-60)+"px")
    .style("top", (e.screenY-90)+"px");
};

const hideTooltip = function() {
  townNameLabel.transition()
    .duration(100)
    .style("opacity", 0);
};

class DataCircles extends React.Component {
  renderCircle(coords) {
    const townName = coords.properties["TOWN"];

    return (
      <circle
        className={(this.props.highlightedTown === townName) ? "highlight" : null}
        cx={this.props.xScale(coords.properties["median_price_2017"])+this.props.margin.left-5}
        cy={this.props.yScale(coords.properties["rank-2018"])+this.props.margin.top}
        r={4}
        key={Math.random()*1}
        onClick={() => this.props.handleHighlightedTown(townName)}
        onMouseOver={(e) => showTooltip(e,townName)}
        onMouseOut={(e) => hideTooltip()}
      />
    );
  }

  render() {
    return <g>{this.props.data.map(this.renderCircle.bind(this))}</g>
  }
}

class CrossLines extends React.Component {
  render() {
    const lines = this.props.data.map(function(d){
      const townName = d.properties["TOWN"];
      const highlightedTown = this.props.highlightedTown;
      const circleOffset = 5;

      if(townName === highlightedTown){
        const xCoord = this.props.xScale(d.properties["median_price_2017"]);
        const yCoord = this.props.yScale(d.properties["rank-2018"]);

        return (
          <g>
            <line
              x1={xCoord+circleOffset}
              x2={xCoord+circleOffset}
              y1="0"
              y2={this.props.height+this.props.margin.top+circleOffset}
              className="cross-line"
            />
            <line
              x1="0"
              x2={this.props.width+this.props.margin.right+this.props.margin.left}
              y1={yCoord+this.props.margin.top}
              y2={yCoord+this.props.margin.top}
              className="cross-line"
            />
          </g>
        );
      }
    }, this);

    return lines;
  }
}

class XAxis extends React.Component {
  componentDidMount() {
    this.renderAxis();
  }

  renderAxis() {
    const axis = d3.axisBottom(this.props.scale)
      .tickValues([250000,500000,1000000])
      .tickSize([5])
      .tickSizeOuter(0)
      .tickFormat(d3.format(".2s"));

    d3.select(this.axisElement).call(axis);
  }

  render() {
    return <g
        className="x-axis"
        ref={(el) => { this.axisElement = el; }}
        transform={this.props.translate}
      />
  }
}

class ScatterPlot extends React.Component {
  getXScale() {
    const xMin = d3.min(this.props.data.map(function(d){return parseInt(d.properties["median_price_2017"]);}));
    const xMax = d3.max(this.props.data.map(function(d){return parseInt(d.properties["median_price_2017"]);}));

    return d3.scaleLog()
      .domain([xMin, xMax])
      .range([0, this.props.width+this.props.margin.right]);
  }

  getYScale() {
    const yMax = d3.max(this.props.data.map(function(d){return parseInt(d.properties["rank-2018"]);}));

    return d3.scaleLinear()
      .domain([yMax, 1])
      .range([this.props.height, 0]);
  }

  render() {
    const xScale = this.getXScale();
    const yScale = this.getYScale();

    //setup tooltip// Define the div for the tooltip
    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    return (
      <svg className="rank-price-chart"
           width={this.props.width + this.props.margin.left + this.props.margin.right}
           height={this.props.height + this.props.margin.top + this.props.margin.bottom}
      >
        <CrossLines xScale={xScale} yScale={yScale} {...this.props} />
        <DataCircles
          xScale={xScale}
          yScale={yScale}
          tooltip={tooltip}
          {...this.props} />
        <XAxis scale={xScale} translate={`translate(0, ${this.props.height + 20})`} {...this.props} />
        <text x="0" y="12" className="y-axis">HIGHER RANK (BETTER)</text>
        <text x="0" y={this.props.height+this.props.margin.top+5} className="y-axis">LOWER RANK (WORSE)</text>
        <text x={this.props.width-60} y={this.props.height+this.props.margin.top+28} className="y-axis"><title>ABC</title>HOME VALUE</text>
      </svg>
    );
  }
}

class RankPriceChart extends Component {
  render() {
    const {
      highlightedTown,
      handleHighlightedTown,
      data} = this.props;

    // only plot towns with a school rank
    const rankedTowns = data.filter(function(d){
        return (Number(d.properties["rank-2018"]) > 0);
      }, this);

    return (
      <ScatterPlot
        data={rankedTowns}
        highlightedTown={highlightedTown}
        handleHighlightedTown={handleHighlightedTown}
        {...settings}
      />
    );
  }
}

export default RankPriceChart;
