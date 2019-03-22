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
        .style("left", (e.screenX+10)+"px")
        .style("top", (e.screenY-90)+"px");
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
            // TODO: move this to a class
            // d3.select(this).style("stroke","#76a47f").style("stroke-width","0.25");
            d3.select(this).classed("ranked-town", true);
            // return rankToColor(rank);
            // inline color scale to recieve updated changed()const warm = scaleQuantize()
            const warm = scaleQuantize()
              .domain([1,148])
              // https://gka.github.io/palettes/#colors=#FE757E,#FFB880,#FDDC7D|steps=30|bez=1|coL=1
              // .range(['#fe757e','#fe7a7e','#fe7e7e','#ff807e','#ff847f','#ff897f','#ff8c7f','#ff907f','#ff947f','#ff977f','#ff9b7f','#ff9f7f','#ffa37f','#ffa77f','#ffa97f','#ffad7f','#ffb07f','#ffb47f','#ffb77f','#ffba7f','#ffbf7f','#ffc17f','#ffc57f','#ffc87f','#fecb7e','#fecf7e','#fed27e','#fed57e','#fdd97d','#fddc7d']);

// .range(['#311b3a','#361e42','#3b2249','#402651','#452958','#4a2e60','#4e3267','#53366f','#583a76','#5c407e','#604485','#644a8c','#684e93','#6c549a','#6f59a0','#7260a7','#7565ad','#776bb3','#7971b8','#7b77bd','#7c7fc3','#7d86c8','#7d8dcc','#7c93d0','#7a9cd3','#78a3d6','#74aad9','#6fb3da','#68badc','#5ec3dc']);              // .range(['#515fbe','#5464bf','#5769c0','#5a6dc2','#5d71c3','#5f76c4','#627ac5','#647fc6','#6683c7','#6988c9','#6b8dc9','#6d92cb','#6f96cc','#719bcd','#73a0ce','#75a4cf','#77a9d0','#78add1','#7ab3d2','#7cb7d3','#7ebcd4','#7fc1d5','#81c5d6','#82cbd7','#84d0d8','#85d5d9','#86dada','#88dedb','#89e3dc','#8ae8dd']);
//            .range(['#ed4848','#ee4f4b','#f0544e','#f15b52','#f36055','#f46758','#f56d5c','#f6725f','#f77762','#f87c66','#f98169','#fb866d','#fb8b71','#fc9175','#fd9579','#fe9a7c','#fe9f80','#ffa484','#ffaa89','#ffae8d','#ffb491','#ffb895','#ffbd9a','#ffc29d','#ffc7a2','#ffcca7','#ffd0ab','#ffd5af','#ffd9b4','#ffdeb8']);
              //.range(['#ed716d','#ee756f','#ef7a71','#ef7f74','#f08375','#f18778','#f18b7a','#f28e7c','#f3937e','#f39780','#f49a82','#f49e84','#f5a386','#f5a789','#f6ab8b','#f6ae8d','#f7b28f','#f7b791','#f7ba94','#f8bd95','#f8c198','#f8c69a','#f8ca9c','#f9cd9e','#f9d1a0','#f9d5a3','#f9d8a5','#f9dda8','#f9e1aa','#f9e4ac']);
              // .range(['#ec6965','#ed6d67','#ed716b','#ee756d','#ee7a70','#ef7d72','#ef8175','#ef8579','#f0887b','#f08d7e','#f09081','#f19383','#f19887','#f19b8a','#f19f8c','#f1a38f','#f1a693','#f1a995','#f1ad98','#f1b19b','#f1b49e','#f1b8a1','#f1bba4','#f1bfa6','#f1c3aa','#f0c7ad','#f0c9b0','#f0cdb2','#efd0b6','#efd4b9']);

              // .range(['#f1697c','#f26e7d','#f2727f','#f37680','#f37b82','#f47f84','#f48485','#f58787','#f58c88','#f69089','#f6958b','#f6988d','#f79d8e','#f7a190','#f7a592','#f8a993','#f8ac95','#f8b196','#f8b598','#f8b899','#f8bb9b','#f9bf9c','#f9c39e','#f9c7a0','#f9caa1','#f9cea3','#f8d2a4','#f8d7a6','#f8daa8','#f8dea9']);
              .range(['#f1697c','#f16d7e','#f27280','#f27782','#f37b84','#f37f86','#f38388','#f4868a','#f48b8c','#f48f8e','#f49391','#f59792','#f59b95','#f59e97','#f5a299','#f5a69b','#f5aa9d','#f5ad9f','#f5b1a1','#f5b6a4','#f5b9a5','#f5bda8','#f4c0aa','#f4c4ac','#f4c8ae','#f4ccb0','#f3cfb3','#f3d2b5','#f2d6b7','#f2dab9']);
              // .range(['#f4687b','#f56d7d','#f57280','#f57782','#f67a84','#f67f87','#f78389','#f7888b','#f78c8d','#f79090','#f89492','#f89995','#f89d97','#f8a199','#f8a59b','#f8a89e','#f8aca0','#f8b1a3','#f8b4a5','#f8b8a8','#f8bdaa','#f8c0ad','#f8c4ae','#f7c8b2','#f7cbb3','#f7d0b6','#f6d3b9','#f6d8bb','#f6dbbe','#f5dfc0']);
              // .range(['#f4687b','#f56d7e','#f67180','#f77783','#f77b87','#f88089','#f9848c','#f9898f','#fa8e92','#fb9195','#fb9798','#fc9a9b','#fd9f9e','#fda3a1','#fda8a4','#feaba7','#feb0aa','#feb4ad','#ffb8b0','#ffbcb3','#ffc0b6','#ffc5b9','#ffcabc','#ffcdbf','#ffd1c2','#ffd6c5','#ffdac8','#ffddcb','#ffe1cf','#ffe6d2']);
              // .range(['#ff587e','#ff5e7f','#ff6480','#ff6981','#ff6f83','#ff7484','#ff7a85','#ff7f86','#ff8387','#ff8788','#ff8c89','#ff908a','#ff958b','#ff998c','#ff9d8d','#ffa28e','#ffa790','#ffaa91','#ffae92','#ffb293','#ffb694','#ffbb95','#ffbe96','#ffc297','#ffc698','#ffc999','#ffce9a','#ffd29b','#ffd69c','#ffd99d']);
              // .range(['#ff6d8e','#ff7290','#ff7793','#ff7c96','#ff8098','#ff859b','#ff889d','#ff8ca0','#ff91a2','#ff95a5','#ff99a8','#ff9daa','#ffa1ad','#ffa5af','#ffa9b2','#ffacb4','#feb0b7','#feb4ba','#feb8bc','#fdbdbf','#fdc0c1','#fcc3c4','#fcc7c7','#fbccca','#facfcd','#f9d3cf','#f9d6d2','#f8dad5','#f7ded7','#f6e2da']);
              // .range(['#ff587e','#ff6081','#ff6884','#ff6e87','#ff768a','#ff7c8c','#ff828f','#ff8891','#ff8e94','#ff9396','#ff9a99','#ff9f9b','#ffa49e','#ffaaa0','#ffafa2','#ffb4a5','#ffb9a7','#ffbfa9','#ffc4ab','#ffc9ad','#ffceaf','#ffd3b1','#ffd8b3','#ffdcb5','#ffe2b7','#ffe7b9','#ffebbb','#fff1bd','#fff6bf','#fffac1']);
              // .range(['#fb8993','#f98c8b','#f78f85','#f6927f','#f4957b','#f39878','#f29b76','#f19e74','#f1a174','#f1a475','#f1a776','#f1aa78','#f1ad7b','#f2b07f','#f2b383','#f3b788','#f3ba8e','#f4be94','#f4c19a','#f5c5a1','#f5c9a8','#f5cdaf','#f6d1b7','#f6d5bf','#f6d9c7','#f5ddce','#f5e2d6','#f4e6de','#f2ebe6','#f1f0ee']);
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
        .on("mouseout", function(d) {
          let rank = Number(d.properties[schoolRankColumn]);
          hideTooltip();
          if (isNaN(rank)) {
            d3.select(this).style("fill", "#6B7678");
          }
        });

    // use, for town highlighting, add default ID (Boston)
    // svg.append("use")
    //   .attr("xlink:href", '#345');
  }

  render() {
    return (
      <svg className="map ma-towns" preserveAspectRatio="xMinYMin meet"></svg>
    );
  }
}

export default TownsMap;
