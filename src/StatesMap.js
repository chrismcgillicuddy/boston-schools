import React, { Component } from 'react';
import * as d3 from 'd3';
import Textures from 'textures';

class StatesMap extends Component {
  componentWillMount() {
    this.setState({
      data: this.props.data
    });
  }
  componentDidMount() {
    this.draw();
  }
  draw() {
    const newEngland = this.state.data;
    const projection = d3.geoAlbersUsa().scale(31500).translate([-9800, 3740]);
    const path = d3.geoPath().projection(projection);
    const svg = d3.select(".states");
    const features = newEngland.features;

    // SVG texture
    const texture = Textures.lines().size(5).strokeWidth(1).stroke('#6C7779');
    svg.call(texture);

    svg.append("g")
      .attr("id", "states")
      .selectAll("path")
      .data(features)
      .enter().append("path")
        .attr("d", function(d,i) {
          return path(d.geometry);
        })
        .style("fill", function(d){
          return texture.url();
        });
  }
  render() {
    return (
      <svg className="map states" preserveAspectRatio="xMinYMin meet"></svg>
    );
  }
}

export default StatesMap;
