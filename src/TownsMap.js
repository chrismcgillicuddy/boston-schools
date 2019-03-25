import React, { Component } from 'react';
import * as d3 from 'd3';
import { scaleQuantize } from 'd3-scale';
import Textures from 'textures';

// setup
const formatPrice = d3.format("$.2s");

const activeTownClass = "active"; // "active"
const schoolRankColumn = "rank-2018";
const schoolNameColumn = "school";
const medianHomeValueColumn = "median_price_2017";
const townNameColumn = "TOWN";

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
    const townSelectedStyle = function(town, el) {

      // console.log("addTownHoverStyle ", town);
      let rank = Number(town.properties[schoolRankColumn]);

      if (rank > 0) {
        handleHighlightedTown(town.properties[townNameColumn]);
        updateTownDetails(town);
        showTownDetails();
        el.classed(activeTownClass, true);
      }
    }

    // TOOLTIP
    const townNameLabel = d3.select("body")
      .append("div")
      .attr("class", "tooltip map-tooltip")
      .style("opacity", 0);

    const showTooltip = function(e, townName) {
      townNameLabel.transition()
        .duration(100)
        .style("opacity", 1);
      townNameLabel.html(makeTitleCase(townName))
        .style("left", (e.pageX+10)+"px")
        .style("top", (e.pageY+20)+"px");
    };

    const hideTooltip = function() {
      townNameLabel.transition()
        .duration(500)
        .style("opacity", 0);
    };

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

    svg.append("g")
      .attr("id", "towns")
      .selectAll("path")
      .data(data)
      .enter().append("path")
        .filter(function(d) {
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
            d3.select(this).classed("ranked-town", true);
            const warm = scaleQuantize()
              .domain([1,148])
              .range(['#f1697c','#f16d7e','#f27280','#f27782','#f37b84','#f37f86','#f38388','#f4868a','#f48b8c','#f48f8e','#f49391','#f59792','#f59b95','#f59e97','#f5a299','#f5a69b','#f5aa9d','#f5ad9f','#f5b1a1','#f5b6a4','#f5b9a5','#f5bda8','#f4c0aa','#f4c4ac','#f4c8ae','#f4ccb0','#f3cfb3','#f3d2b5','#f2d6b7','#f2dab9']);
            return warm(rank);
          } else {
            d3.select(this).classed("unranked-town", true);
            return "#6C7779"; // neutral grey
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
          townSelectedStyle(d, d3.select(this));
        })
        .on("touchstart", function(d){
          d3.selectAll("."+activeTownClass).classed(activeTownClass, false); // remove
          townSelectedStyle(d, d3.select(this));
        })
        .on("mouseover", function(d) {
          let town = d.properties[townNameColumn];
          let rank = Number(d.properties[schoolRankColumn]);
          showTooltip(d3.event, town);
          if (isNaN(rank)) {
            d3.select(this).style("fill", "#A0A9AA");
          }
        })
        .on("mousemove", function(d) {
          let town = d.properties[townNameColumn];
          let rank = Number(d.properties[schoolRankColumn]);
          showTooltip(d3.event, town);
          if (isNaN(rank)) {
            d3.select(this).style("fill", "#A0A9AA");
          }
        })
        .on("mouseout", function(d) {
          let rank = Number(d.properties[schoolRankColumn]);
          hideTooltip();
          if (isNaN(rank)) {
            d3.select(this).style("fill", "#6B7678");
          }
        });

  }

  render() {
    return (
      <svg className="map ma-towns" preserveAspectRatio="xMinYMin meet"></svg>
    );
  }
}

export default TownsMap;
