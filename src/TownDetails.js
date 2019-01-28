import React, { Component } from 'react';

class TownDetails extends Component {

  render() {
    return (
      <div className="town-details">
          <h2 className="town-name" id="town-name"></h2>
          <div className="town-detail">
            <div className="school-name" id="school-name"></div>
            <div className="school-rank" id="school-rank"></div>
          </div>
          <div className="town-detail">
            <div className="price-label">Median home value</div>
            <div className="median-home-price" id="median-price"></div>
          </div>
      </div>
    );
  }
}

export default TownDetails;
