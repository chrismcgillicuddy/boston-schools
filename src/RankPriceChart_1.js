// http://bl.ocks.org/weiglemc/6185069
// d3 v4
// https://bl.ocks.org/d3noob/6f082f0e3b820b6bf68b78f2f7786084

// var margin = {top: 20, right: 20, bottom: 30, left: 40},
//     width = 960 - margin.left - margin.right,
//     height = 500 - margin.top - margin.bottom;

// add the graph canvas to the body of the webpage
// var svg = d3.select("body").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// draw dots
 // svg.selectAll(".dot")
 //     .data(data)
 //   .enter().append("circle")
 //     .attr("class", "dot")
 //     .attr("r", 3.5)
 //     .attr("cx", xMap)
 //     .attr("cy", yMap)
 //     .style("fill", function(d) { return color(cValue(d));})
 //     .on("mouseover", function(d) {
 //         tooltip.transition()
 //              .duration(200)
 //              .style("opacity", .9);
 //         tooltip.html(d["Cereal Name"] + "<br/> (" + xValue(d)
 //         + ", " + yValue(d) + ")")
 //              .style("left", (d3.event.pageX + 5) + "px")
 //              .style("top", (d3.event.pageY - 28) + "px");
 //     })
 //     .on("mouseout", function(d) {
 //         tooltip.transition()
 //              .duration(500)
 //              .style("opacity", 0);
 //     });

import React, { Component } from 'react';
import * as d3 from 'd3';

class RankPriceChart extends Component {
  // componentWillMount() {
  //   this.setState({
  //     data: this.props.data
  //   });
  // }
  componentDidMount() {
    this.draw();
  }
  componentWillUpdate() {
    this.draw();
  }
  draw() {
    const {
      highlightedTown,
      priceRange,
      data} = this.props;
    const schoolRankColumn = "rank-2018";
    const medianHomeValueColumn = "median_price_2017";
    const townNameColumn = "TOWN";

    const rankedTowns = data.filter(function(d){
        return ((Number(d.properties[schoolRankColumn]) > 0) && (d.properties[medianHomeValueColumn] >= priceRange[0]) && (d.properties[medianHomeValueColumn] <= priceRange[1]));
      }, this);

    const updateUse = function(i){
      console.log("update use:", i);
      svg.select("use").attr("xlink:href", "#dot-"+i);
    }

    // min / max
    const maxSchoolRank = d3.max(rankedTowns.map(function(d){return parseInt(d.properties[schoolRankColumn]);}));
    const minHomeValue = d3.min(rankedTowns.map(function(d){return parseInt(d.properties[medianHomeValueColumn]);}));
    const maxHomeValue = d3.max(rankedTowns.map(function(d){return parseInt(d.properties[medianHomeValueColumn]);}));

    // console.log("maxSchoolRank",maxSchoolRank);
    // console.log("minHomeValue",minHomeValue);
    // console.log("maxHomeValue",maxHomeValue);
    // console.log("rankedTowns",rankedTowns);

    const margin = {top: 10, right: 10, bottom: 30, left: 10},
          width = 500 - margin.left - margin.right,
          height = 275 - margin.top - margin.bottom;

    // scales// set the ranges
    const x = d3.scaleLinear().domain([minHomeValue,maxHomeValue]).range([0, width]);
    const xLog = d3.scaleLog().domain([minHomeValue,maxHomeValue]).range([0, width]);
    const y = d3.scaleLinear().domain([maxSchoolRank, 1]).range([height, 0]);

    // console.log("x(300000)", x(300000));
    // console.log("x(1800000)", x(1800000));
    // console.log("y(148)", y(148));
    // console.log("y(1)", y(1));

    var xAxis = d3.axisBottom(xLog)
                  .tickSizeOuter(0)
                  .ticks(d3.format(".2s"),4);
                  // .tickValues([250000,450000,750000,1000000,1400000,1900000])
                  // .tickFormat( d3.format(".2s") );

    // setup SVG
    const svg = d3.select(".rank-price-chart")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom);

    // clear previous elements
    svg.selectAll("g").remove();
    svg.selectAll("use").remove();

    // svg.append("use")
    //   .attr("xlink:href", '#dot-1');

    svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .selectAll("dot")
        .data(rankedTowns)
      .enter().append("circle")
        .attr("r", 4)
        .attr("id", function(d, i){
          return "dot-"+i;
        })
        .attr("class", function(d,i){
          if (d.properties[townNameColumn] === highlightedTown) {
            // update use
            console.log("NEW HIGHLIGHT", i);
            // console.log();
            updateUse(i);
            return "highlight";
          }
        })
        .attr("cx", function(d,i) {
          // console.log(i, d.properties[townNameColumn], highlightedTown, d.properties[medianHomeValueColumn], d.properties[schoolRankColumn]);
          return xLog(d.properties[medianHomeValueColumn])-5; })
        .attr("cy", function(d) { return y(d.properties[schoolRankColumn]); });

    // Add the X Axis
    d3.select(".rank-price-chart")
        .append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(0," + (height+(margin.bottom/2)) + ")")
        .call(xAxis);



  }
  render() {
    return (
      <svg className="rank-price-chart" preserveAspectRatio="xMinYMin meet"></svg>
    );
  }
}

 export default RankPriceChart;
