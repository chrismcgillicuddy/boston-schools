import React, { Component } from 'react';

class Sources extends Component {

  render() {
    return (
      <footer className="data-sources">
        <p>Home values reflect the town's median home sales price in 2017.<br/>
        {/* Data provided by the <a href="http://marealtor.com">Massachusetts Association of Realtors</a>and <a href="http://mlspin.com">MLS Property Information Network</a>.<br />
        */}
        Home value source: Boston Magazine, <a href="https://www.bostonmagazine.com/top-places-to-live-2018-single-family-homes/">Single-Family Home Prices in Greater Boston 2018</a>.<br />
        School rank source: Boston Magazine, <a href="https://www.bostonmagazine.com/education/best-public-high-schools-boston-2018-chart/">Best Public High Schools in Boston 2018</a>.</p>

{/*
      <p>School rankings source: <a href="https://www.bostonmagazine.com/education/best-public-high-schools-boston-2018-chart/">Best Public High Schools in Boston 2018, Boston Magazine</a>
      </p>
      <p>Home prices reflect the median

      Home values source Boston Magazine: <a href="https://www.bostonmagazine.com/top-places-to-live-2018-single-family-homes/">Single-Family Home Prices in Greater Boston 2018</a>
      </p>
      <p>Median home price data augmented by <a href="http://www.trulia.com">Trulia.com</a> and <a href="http://www.realtor.com">Realtor.com</a>.</p>
*/}
      </footer>
    );
  }
}

export default Sources;
