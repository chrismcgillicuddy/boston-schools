import React, { Component } from 'react';
import * as d3 from 'd3';

class Header extends Component {
  componentDidMount() {
    // app info icon
    d3.select(".app-info")
      .on("click", function(){
        d3.select(".header").classed("show-details", function(){
          return !this.classList.contains("show-details");
        });
      })
      .on("touchstart", function(){
        d3.select(".header").classed("show-details", function(){
          return !this.classList.contains("show-details");
        });
      });

    // close app details
    d3.select(".close-app-details")
      .on("click", function(){
        d3.select(".header").classed("show-details", false);
      })
      .on("touchstart", function(){
        d3.select(".header").classed("show-details", false);
      });
  }
  render() {
    return (
      <header className="header">
        <h1 className="h1">
          <span>Affording education</span> Greater Boston school rankings and home prices
        </h1>
        <div className="app-info"></div>
        <div className="app-details">
            <p>School rankings<br />
            Boston Magazine: <a href="https://www.bostonmagazine.com/education/best-public-high-schools-boston-2018-chart/">Best Public High Schools in Boston 2018</a>
            </p>
            <p>Home values<br />
            Boston Magazine:  <a href="https://www.bostonmagazine.com/top-places-to-live-2018-single-family-homes/">Single-Family Home Prices in Greater Boston 2018</a>
            </p>
            <p>Median home price data augmented by <a href="http://www.trulia.com">Trulia.com</a> and <a href="http://www.realtor.com">Realtor.com</a>.</p>
          <span className="close-app-details">Close</span>
        </div>
      </header>
    );
  }
}

export default Header;
