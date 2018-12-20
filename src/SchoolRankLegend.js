import React, { Component } from 'react';

class SchoolRankLegend extends Component {

  render() {
    return (
      <div className="school-rank-legend">
        <p>School rank</p>
        <div className="school-gradient"></div>
        <div className="legend-labels">
          <span className="left-label">Lower</span>
          <span className="right-label">Higher</span>
        </div>
      </div>
    );
  }
}

export default SchoolRankLegend;
