import React, { Component } from 'react';
import * as d3 from 'd3';
import { scaleQuantize } from 'd3-scale';
import Textures from 'textures';

// setup
const formatPrice = d3.format("$.2s");

// let isInitialRender = true; // used to place default town highlight
const activeTownClass = "active"; // "active"
const schoolRankColumn = "rank-2018";
const schoolNameColumn = "school";
const medianHomeValueColumn = "median_price_2017";
const townNameColumn = "TOWN";
// let rankedTownCount = 148;

// used for converting town names from ALL CAPS
const makeTitleCase = function(str) {
  // http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript/196991#196991
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

class TownsMap extends Component {
  componentDidMount() {
    this.draw();
  }
  componentDidUpdate() {
    this.draw();
  }
  draw() {
    const {
      highlightedTown,
      handleHighlightedTown,
      rankedTownCount,
      data} = this.props;
    // map setup
    const projection = d3.geoAlbersUsa().scale(31500).translate([-9800, 3740]);
    const path = d3.geoPath().projection(projection);

    // select town/region color based on school rank
    const rankToColor = function(value, max) {
      const warm = scaleQuantize()
        .domain([1,rankedTownCount])
        .range(['#fb8993','#f98c8b','#f78f85','#f6927f','#f4957b','#f39878','#f29b76','#f19e74','#f1a174','#f1a475','#f1a776','#f1aa78','#f1ad7b','#f2b07f','#f2b383','#f3b788','#f3ba8e','#f4be94','#f4c19a','#f5c5a1','#f5c9a8','#f5cdaf','#f6d1b7','#f6d5bf','#f6d9c7','#f5ddce','#f5e2d6','#f4e6de','#f2ebe6','#f1f0ee']);
        // .range([
        //         '#fb8993',
        //         '#f1a776',
        //         '#f5c9a8',
        //         '#f1f0ee']);
      return warm(value);
    }

    // create base SVG
    const svg = d3.select(".ma-towns");

    // SVG textures
    // default texture
    const texture = Textures.lines().size(6).strokeWidth(1).stroke('#ddd');
    svg.call(texture);
    // highlight texture
    const highlightTexture = Textures.lines().size(6).background("#fbf897").strokeWidth(1).stroke('#333');
    svg.call(highlightTexture);

    // populate town name, rank and median price
    const showTownDetails = function() {
      d3.select(".town-details").classed("hidden", false);
    }

    // highlight town on map, either color or texture
    const addTownHoverStyle = function(town, el) {

      // console.log("addTownHoverStyle ", town);
      let rank = Number(town.properties[schoolRankColumn]);

      if (rank > 0) {
        handleHighlightedTown(town.properties[townNameColumn]);
        updateTownDetails(town);
        showTownDetails();
        el.classed(activeTownClass, true);

        // update SVG <use> to render stroke above neighboring paths
        svg.select("use")
          .attr("xlink:href", "#"+el._groups[0][0].id);
      }
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
        d3.select('.tooltip').classed("has-rank", true);
        d3.select(".school-rank").style("background-color", rankToColor(rank, 148));
      } else {
        d3.select('.tooltip').classed("has-rank", false);
      }

      // show median label?
      if (median > 0) {
        d3.select('.tooltip').classed("has-median", true);
      } else {
        d3.select('.tooltip').classed("has-median", false);
      }
    }

    // count number of matching items
    // rankedTowns = data.filter(function(d){
    //               return ((Number(d.properties[schoolRankColumn]) > 0) && (d.properties[medianHomeValueColumn] >= priceRange[0]) && (d.properties[medianHomeValueColumn] <= priceRange[1]));
    //             }, this).length;

    svg.append("g")
      .attr("id", "towns")
      .selectAll("path")
      .data(data)
      .enter().append("path")
        .filter(function(d) {
          // console.log("compare home value,",Number(d.properties[medianHomeValueColumn]));
          return d;})
        .attr("id", function(d, i){
          return i;
        })
        .attr("d", function(d) {
          return path(d.geometry);
        })
        .style("fill", function(d) {
          let rank = Number(d.properties[schoolRankColumn]);
          d3.select(this).classed("town", true);

          if(rank > 0 && (d.properties[medianHomeValueColumn])) {
            // TODO: move this to a class
            // d3.select(this).style("stroke","#76a47f").style("stroke-width","0.25");
            d3.select(this).classed("ranked-town", true);
            // return rankToColor(rank);
            // inline color scale to recieve updated changed()const warm = scaleQuantize()
            const warm = scaleQuantize()
              .domain([1,148])
              .range(['#fb8993','#f98c8b','#f78f85','#f6927f','#f4957b','#f39878','#f29b76','#f19e74','#f1a174','#f1a475','#f1a776','#f1aa78','#f1ad7b','#f2b07f','#f2b383','#f3b788','#f3ba8e','#f4be94','#f4c19a','#f5c5a1','#f5c9a8','#f5cdaf','#f6d1b7','#f6d5bf','#f6d9c7','#f5ddce','#f5e2d6','#f4e6de','#f2ebe6','#f1f0ee']);
              // .range([
              //         '#fb8993',
              //         '#f1a776',
              //         '#f5c9a8',
              //         '#f1f0ee']);
            return warm(rank);

          } else {
            d3.select(this).classed("unranked-town", true);
            return "#6C7779";
          }
        })
        .classed(activeTownClass, function(d) {
          // highlight default town
          if ((d.properties[townNameColumn] === highlightedTown)) {
            updateTownDetails(d);
            return true;
          }
        })
        .on("click", function(d){
          d3.selectAll("."+activeTownClass).classed(activeTownClass, false); // remove
          addTownHoverStyle(d, d3.select(this));
        })
        .on("touchstart", function(d){
          d3.selectAll("."+activeTownClass).classed(activeTownClass, false); // remove
          addTownHoverStyle(d, d3.select(this));
        })
        .on("mouseover", function(d) {
          // TODO: apply hover class
        })
        .on("mouseout", function(d) {
          // TODO: remove hover class
        });

    // use, for town highlighting, add default ID (Boston)
    svg.append("use")
      .attr("xlink:href", '#345');
  }

  render() {
    return (
      <svg className="map ma-towns" preserveAspectRatio="xMinYMin meet"></svg>
    );
  }
}

export default TownsMap;
