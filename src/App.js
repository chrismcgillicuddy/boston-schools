import React, { Component } from 'react';
import './App.scss';
import * as d3 from 'd3';
import * as TopoJSON from 'topojson';
import TownsMap from './TownsMap';
import StatesMap from './StatesMap';
import TownDetails from './TownDetails';
import Header from './Header';
import SchoolRankLegend from './SchoolRankLegend';
import PriceFilter from './PriceFilter';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      matchingTownCount: 148,
      massTowns: {},
      newEnglandStates: {},
      priceRange: [200000,2000000]
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
      console.log("ESC");
      d3.select(".header").classed("show-details", false);
    }
  }

  handlePriceRange = (newRange) => {
    this.setState({priceRange: newRange});
  }

  handleMatchingTownCount = (newCount) => {
    this.setState({matchingTownCount: newCount});
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="loading">Building map...</div>
      )
    } else {
      let priceRange = this.state.priceRange;
      let matchingTownCount = this.state.matchingTownCount;
      let massTowns = this.state.massTowns;
      let newEnglandStates = this.state.newEnglandStates;

      return (
        <div className='app-container'>
          <StatesMap data={newEnglandStates} />
          <TownsMap matchingTownCount={matchingTownCount} updateTownCount={this.handleMatchingTownCount} priceRange={priceRange} data={massTowns} />
          <TownDetails />
          <Header />
          <SchoolRankLegend />
          <PriceFilter priceRange={priceRange} updateRange={this.handlePriceRange} />
        </div>
      )
    }
  }
}

export default App;
