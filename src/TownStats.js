import React, { Component } from 'react';

class TownStats extends Component {

  render() {
    return (
      <div className="town-details">
        <h2 className="town-name" id="town-name"></h2>
        <div className="town-detail">
          <div className="label">School rank</div>
          <div className="value" id="school-rank"></div>
        </div>
        <div className="town-detail">
          <div className="label">Home value</div>
          <div className="value" id="median-price"></div>
        </div>
      </div>
    );
  }
}

export default TownStats;
