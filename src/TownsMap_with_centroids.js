/////////////////////////////////////////
// Experimenting with flubber library
// transforming towns' shapes to circles in a chart and back to a map

import React, { Component } from 'react';
import * as d3 from 'd3';
import { scaleLinear, scaleLog, scaleQuantize, scaleThreshold } from 'd3-scale';
import * as _ from 'lodash';
import Textures from 'textures';
import { toCircle, fromCircle, combine, toPathString } from 'flubber';

// setup
const width = 1000, height = 1000;
const formatPrice = d3.format("$,"); // for dollar
const formatMedian = d3.format("s"); // e.g '300k'
const defaultTown = "BOSTON"; // highlight this town to start things off
let isInitialRender = true; // used to place default town highlight
const activeTownClass = "active"; // "active"
const schoolRankColumn = "rank-2018";
const schoolNameColumn = "school";
const townPopulationColumn = "POP2010";
const medianHomeValueColumn = "median_price_2017";
const townNameColumn = "TOWN";

// color scales
const warm = scaleQuantize()
  .domain([0,148])
  // .range(['#fb8993','#f98c8b','#f78f85','#f6927f','#f4957b','#f39878','#f29b76','#f19e74','#f1a174','#f1a475','#f1a776','#f1aa78','#f1ad7b','#f2b07f','#f2b383','#f3b788','#f3ba8e','#f4be94','#f4c19a','#f5c5a1','#f5c9a8','#f5cdaf','#f6d1b7','#f6d5bf','#f6d9c7','#f5ddce','#f5e2d6','#f4e6de','#f2ebe6','#f1f0ee']);
  .range([
          '#fb8993',
          '#f1a776',
          '#f5c9a8',
          '#f1f0ee']);
const blue = d3.scaleLinear()
  .domain([0, 1400000])
  .range(['#fff','#6495ed']);
// select town/region color based on school rank
const rankToColor = function(value) {
  return warm(value);
}
const priceToColor = function(value) {
  return blue(value);
}

// used for converting town names from ALL CAPS
const makeTitleCase = function(str) {
  // http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript/196991#196991
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
// school rank slider scale
//const rankScale = scaleLinear().domain([148, 1]).range([-4, 376]); // TODO: create dynamic domain (max rank)
// price scale
//const priceScale = scaleLog().domain([0, 1912500]).range([-4, 376]); // TODO: create dynamic domain (from max price)

const projection = d3.geoAlbersUsa().scale(31500).translate([-9800, 3700]);
const path = d3.geoPath().projection(projection);

class TownsMap extends Component {
  constructor(props){
    super(props);
  }
  componentWillMount() {
    this.setState({
      range: this.props.priceRange,
      data: this.props.data,
      show: this.props.show
    });
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ show: nextProps.show });
  }
  componentDidMount() {
    this.draw();
  }
  makeDots() {
    // note the most and least populated towns
    const maxTownPopulation = d3.max(this.state.data.map(function(d){return d.properties[townPopulationColumn];}));
    const minTownPopulation = d3.min(this.state.data.map(function(d){return d.properties[townPopulationColumn];}));
    const maxCircleRadius = 30;
    const minCircleRadius = 4;
    // min town population: 75, max town population: 617594
    const populationScale = d3.scaleLinear()
      .domain([minTownPopulation,maxTownPopulation])
      .range([minCircleRadius,maxCircleRadius]);

    const svg = d3.select(".ma-towns").attr("width", width).attr("height", height);

    // hide unranked towns
    svg.classed("hide-unranked", true);

    svg.selectAll(".ranked-town")
      .data(this.state.data)
      .filter(function(d) { return Number(d.properties[schoolRankColumn]) > 0 })
      .transition()
      .duration(500)
      .attrTween("d", function(d,i){
        let townGeometry = path(d.geometry);
        let interpolator = toCircle(townGeometry, 30, ((i*7)+50), populationScale(d.properties[townPopulationColumn]));
        return interpolator;
      })
      .style("opacity", "0.75")
      .style("stroke", "rgba(0, 0, 0, 0.5)");

      // new england states go away
      d3.selectAll(".states")
        .attr("class", "exit");

  }
  makeMap() {
    // note the most and least populated towns
    const maxTownPopulation = d3.max(this.state.data.map(function(d){return d.properties[townPopulationColumn];}));
    const minTownPopulation = d3.min(this.state.data.map(function(d){return d.properties[townPopulationColumn];}));
    const maxCircleRadius = 30;
    const minCircleRadius = 4;
    // min town population: 75, max town population: 617594
    const populationScale = d3.scaleLinear()
      .domain([minTownPopulation,maxTownPopulation])
      .range([minCircleRadius,maxCircleRadius]);

    const svg = d3.select(".ma-towns").attr("width", width).attr("height", height);

    svg.selectAll(".town")
      .data(this.state.data)
      .filter(function(d) { if(Number(d.properties[schoolRankColumn]) > 0){ return d; } })
      .transition()
      .duration(500)
      .attrTween("d", function(d){
        let coords = d.geometry.coordinates.map(function(d){ return d[0]; });
        let townGeometry = path(d.geometry);
        let interpolator = fromCircle(d.x0, d.y0, populationScale(d.properties[townPopulationColumn]),townGeometry);
        return interpolator;
      })
      .style("fill", function(d) {
        let rank = Number(d.properties[schoolRankColumn]);
        // console.log("Props",d.properties);
        d3.select(this).classed("town", true);

        if(rank > 0) {
          // TODO: move this to a class
          // d3.select(this).style("stroke","#76a47f").style("stroke-width","0.25");
          d3.select(this).classed("ranked-town", true);
          return rankToColor(rank);
        } else {
          d3.select(this).classed("unranked-town", true);
        }
      });
  }

  draw() {
    // map set up
    const projection = d3.geoAlbersUsa().scale(31500).translate([-9800, 3700]);
    const path = d3.geoPath().projection(projection);
    const svg = d3.select(".ma-towns").attr("width", width).attr("height", height);

    // SVG textures
    // default texture
    const texture = Textures.lines().size(6).strokeWidth(1).stroke('#ddd');
    svg.call(texture);
    // highlight texture
    const highlightTexture = Textures.lines().size(6).background("#fbf897").strokeWidth(1).stroke('#333');
    svg.call(highlightTexture);


    const handleGradientMouseOver = function(d, i){
      // console.log("gradient mouse over", d.x, d.y);
      // d.x
      // d.y

      // Use D3 to select element, change color and size
      // d3.select(this).attr({
      //
      // });
    }

    // attach mouse over to school rank gradient
    // d3.select(".gradient").on("mouseover", handleGradientMouseOver);

    // populate town name, rank and median price

    const showTownDetails = function() {
      d3.select(".town-details").classed("hidden", false);
    }

    const hideTownDetails = function() {
      d3.select(".town-details").classed("hidden", true);
    }

    // highlight town on map, either color or texture
    const addTownHoverStyle = function(town, el) {

      // console.log("addTownHoverStyle ", town);
      let rank = Number(town.properties[schoolRankColumn]);

      if (rank > 0) {
        updateTownDetails(town);
        showTownDetails();
        el.classed(activeTownClass, true);
      } else {
        // el.style("fill", function(d){
        //   // return highlightTexture.url();
        //   return "#fdf37d";
        // })
      }
    }

    const removeTownHoverStyle = function(town, el) {
      // if rank is available then add the Active class, otherwise default style
      let rank = Number(town.properties[schoolRankColumn]);

      if (rank > 0) {
        el.classed(activeTownClass, false);
      } else {
        el.style("fill", function(d){
          return "#6C7779";
        })
      }
    }

    const getCoordinates = function(d) {
      // return d.geometry.coordinates[0].map(function(d){ return d[0]; })
    }

    const updateTownDetails = function(town) {
      let rank = Number(town.properties[schoolRankColumn]);
      let school = town.properties[schoolNameColumn];
      let median = Number(town.properties[medianHomeValueColumn]);
      let townName = town.properties[townNameColumn];

      // add town stats to the tooltip
      d3.select("#town-name").text(makeTitleCase(townName));
      d3.select("#school-name").text(school);
      d3.select("#school-rank").text(rank);
      d3.select("#median-price").text(formatPrice(median));

      // show the rank label?
      if (rank > 0) {
        // console.log("Hover, rank: ", rank);
        d3.select('.tooltip').classed("has-rank", true);
        // position the school rank indicator
        // var rankPosition = Math.floor(rankScale(rank))+"px";
        // d3.select(".school-rank").style("display", "block");
        d3.select(".school-rank").style("background-color", rankToColor(rank));
        // d3.select(".rank-slider").property("value", 149-rank); // TODO: make max rank dynamic
      } else {
        // d3.select(".school-rank").style("display", "none");
        // console.log("no rank");
        d3.select('.tooltip').classed("has-rank", false);
      }

      // show median label?
      if (median > 0) {
        // console.log("median: ", median);
        // console.log("median scaled:",Math.floor(priceScale(median)));

        d3.select('.tooltip').classed("has-median", true);
        // var pricePosition = Math.floor(priceScale(median))+"px";
        // d3.select(".price-rank").style("display", "block");
        // d3.select(".price-rank").style("left", pricePosition);
      } else {
        d3.select('.tooltip').classed("has-median", false);
      }
    }

    // const transitionTowns = function() {
    //   // console.log("test");
    //   // console.log(svg);
    //   // let rankedTowns = svg.selectAll(".ranked-town");
    //   // console.log({ rankedTowns });
    //
    //   svg.selectAll(".town")
    //     .data(massTowns)
    //     .filter(function(d) { return d.properties[schoolRankColumn] > 0 })
    //     .transition()
    //     .duration(900)
    //     .attrTween("d", function(d){
    //       // console.log(d.geometry.coordinates[0]);
    //       // let townGeometry = getCoordinates(d);
    //       // let townGeometryCombined = combine(islands, next, { maxSegmentLength: 20, single: true });
    //       // console.log("PATH",path(d.geometry));
    //       // console.log("Geometry",d.geometry);
    //       // console.log("PROPS",d.properties);
    //
    //       let townGeometry = path(d.geometry);
    //       // console.log("T1",{ townGeometry });
    //       // townGeometry = toPathString(d.geometry.coordinates[0]);
    //       // console.log("T2",{ townGeometry });
    //
    //       let interpolator = toCircle(townGeometry, d.x0, d.y0, populationScale(d.properties[townPopulationColumn]));
    //
    //       return interpolator;
    //     })
    //     // .style("fill", "rgba(255, 49, 255, 0.388)")
    //     .style("opacity", "0.75")
    //     .style("stroke", "rgba(0, 0, 0, 0.5)")
    //     // .style("stroke-width", 0.1);
    //
    //     d3.selectAll(".states")
    //       .attr("class", "exit");
    //
    // }

    // const townColor = function(town, el) {
    //   let rank = town.properties[schoolRankColumn];
    //
    //   if(rank > 0) {
    //     // TODO: move this to a class
    //     el.style("stroke","#76a47f").style("stroke-width","0.25");
    //     return "#f00";
    //   } else {
    //     return u.url();
    //   }
    // }

    // add onClick to button
    // d3.select("#change-map")
    //   .on("click", function(){
    //     transitionTowns();
    //   });
    // console.log(this.state);
    const massTowns = this.state.data;

    // // note the most and least populated towns
    // const maxTownPopulation = d3.max(massTowns.map(function(d){return d.properties[townPopulationColumn];}));
    // const minTownPopulation = d3.min(massTowns.map(function(d){return d.properties[townPopulationColumn];}));
    // const maxCircleRadius = 30;
    // const minCircleRadius = 4;
    //
    // // min town population: 75, max town population: 617594
    // const populationScale = d3.scaleLinear()
    //   .domain([minTownPopulation,maxTownPopulation])
    //   .range([minCircleRadius,maxCircleRadius]);

    // add town centroids
    massTowns.forEach(function(town){
      let centroid = path.centroid(town);
      town["x0"] = centroid[0];
      town["y0"] = centroid[1];
    });

    svg.append("g")
      .attr("id", "towns")
      .selectAll("path")
      .data(massTowns)
      .enter().append("path")
        // .filter(function(d) { return d.properties[schoolRankColumn] > 0 })
        .attr("d", function(d) {
          return path(d.geometry);
        })
        .style("fill", function(d) {
          let rank = Number(d.properties[schoolRankColumn]);
          d3.select(this).classed("town", true);

          if(rank > 0) {
            // TODO: move this to a class
            // d3.select(this).style("stroke","#76a47f").style("stroke-width","0.25");
            d3.select(this).classed("ranked-town", true);
            return rankToColor(rank);
          } else {
            d3.select(this).classed("unranked-town", true);
            return "#6C7779";
          }
        })
        .classed(activeTownClass, function(d) {
          // highlight default town
          if (isInitialRender && (d.properties[townNameColumn] === defaultTown)) {
            updateTownDetails(d);
            return true;
          }
        })
        .on("click", function(d){
          d3.select("."+activeTownClass).classed(activeTownClass, false); // remove
          addTownHoverStyle(d, d3.select(this));
        })
        .on("mouseover", function(d) {
          // d3.select("."+activeTownClass).classed(activeTownClass, false); // remove
        })
        .on("mouseout", function(d) {
          // removeTownHoverStyle(d, d3.select(this));
          // hideTownDetails();
        });

        isInitialRender = false; // disable default town highlighting

  // draw centroids
  // svg.append("g")
  //   .selectAll(".centroid").data(massTowns)
  //   .enter().append("circle")
  //     .attr("class", "centroid")
  //     .attr("fill", "rgba(255, 49, 255, 0.388)")
  //     .attr("stroke", "rgba(0, 0, 0, 0.5)")
  //     .attr("stroke-width", 0.1)
  //     .attr("r", "10")
  //     .attr("cx", function (d){ return d.x0; })
  //     .attr("cy", function (d){ return d.y0; });

    // legend
    // const linear = d3.scaleLinear()
    //   .domain([0,1,2,3,4,5])
    //   .range(['#f59775','#efae78','#efbf8e','#f0cfab','#f0dfca','#efeeec']);
    //
    // svg.append("g")
    //   .attr("class", "legendLinear")
    //   .attr("transform", "translate(50,750)");
    //
    // const legendLinear = d3.legendColor()
    //   .shapeWidth(30)
    //   .shapeHeight(10)
    //   .cells(6)
    //   .orient('horizontal')
    //   .labels(["Best schools","","","","","Worst"])
    //   .scale(linear);
    //
    // svg.select(".legendLinear").call(legendLinear);

  }
  render() {
    if(this.state.show){
      (!isInitialRender)
      ? this.makeMap()
      : console.log("Initial render");
    }else {
      this.makeDots();
    }
    return (
      <svg className="map ma-towns"></svg>
    );
  }
}

export default TownsMap;
