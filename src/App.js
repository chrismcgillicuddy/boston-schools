import React, { Component } from 'react';
import './App.scss';
import * as d3 from 'd3';
import * as TopoJSON from 'topojson';
import TownsMap from './TownsMap';
import StatesMap from './StatesMap';
import TownStats from './TownStats';
import SchoolRankLegend from './SchoolRankLegend';
import RankPriceChart from './RankPriceChart';
import Sources from './Sources';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      rankedTownCount: 148,
      highlightedTown: "BOSTON", // default town to highlight
      massTowns: {},
      newEnglandStates: {}
    }
  }

  componentDidMount() {
    Promise.all([
      fetch('data/massTowns.json',
        {headers:
          {'Accept': 'application/json',
          'Content-Type': 'application/json'
          }
        }
      ),
      fetch('data/newEnglandStates.geojson',
        {headers:
          {'Accept': 'application/json',
          'Content-Type': 'application/json'
          }
        }
      )
    ]).then(responses => Promise.all(responses.map(resp => resp.json())))
    .then(([townData, statesData]) => {

      // convert TopoJSON to GeoJSON
      const towns = TopoJSON.feature(townData, townData.objects.towns).features;

      this.setState({
        massTowns: towns,
        newEnglandStates: statesData,
        loading: false
      });
    });

    // handle ESC
    document.addEventListener("keydown", this.closeAppDetails, false);

  }
  componentWillUnmount(){
    document.removeEventListener("keydown", this.closeAppDetails, false);
  }

  closeAppDetails = (event) => {
    if(event.keyCode === 27) {
      d3.select(".header").classed("show-details", false);
    }
  }

  handleRankedTownCount = (newCount) => {
    this.setState({rankedTownCount: newCount});
  }

  handleHighlightedTown = (town) => {
    this.setState({highlightedTown: town});
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="loader">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )
    } else {
      const highlightedTown = this.state.highlightedTown,
            rankedTownCount = this.state.rankedTownCount,
            massTowns = this.state.massTowns,
            newEnglandStates = this.state.newEnglandStates;

      return (
        <div className='app-container'>
          <StatesMap
            data={newEnglandStates}
          />
          <TownsMap
            highlightedTown={highlightedTown}
            handleHighlightedTown={this.handleHighlightedTown}
            matchingTownCount={rankedTownCount}
            updateTownCount={this.handleRankedTownCount}
            data={massTowns}
          />
          <div className="header-with-chart">
            <h1>GREATER BOSTON <span className="heading-bold">HIGH SCHOOL RANK</span> vs <span className="heading-bold">HOME VALUE</span></h1>
            <TownStats />
            <RankPriceChart
              highlightedTown={highlightedTown}
              handleHighlightedTown={this.handleHighlightedTown}
              data={massTowns}
            />
          </div>
          <SchoolRankLegend />
          <Sources />
        </div>
      )
    }
  }
}

export default App;
