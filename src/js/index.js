import 'd3-transition';

import * as d3 from 'd3-selection';

import { appendSelect } from 'd3-appendselect';
import merge from 'lodash/merge';
import { scaleOrdinal } from 'd3-scale';

d3.selection.prototype.appendSelect = appendSelect;

/**
 * Write your chart as a class with a single draw method that draws
 * your chart! This component inherits from a base class you can
 * see and customize in the baseClasses folder.
 */
class ParliamentChart {
  selection(selector) {
    if (!selector) return this._selection;
    this._selection = d3.select(selector);
    return this;
  }

  data(newData) {
    if (!newData) return this._data || this.defaultData;
    this._data = newData;
    return this;
  }

  props(newProps) {
    if (!newProps) return this._props || this.defaultProps;
    this._props = merge(this._props || this.defaultProps, newProps);
    return this;
  }

  /**
   * Default data for your chart. Generally, it's NOT a good idea to import
   * a big dataset and assign it here b/c it'll make your component quite
   * large in terms of file size. At minimum, though, you should assign an
   * empty Array or Object, depending on what your chart expects.
   */
  defaultData = [
    {
      id: 'gop',
      seats: 211,
    },
    {
      id: 'dem',
      seats: 221,
    },
  ];

  /**
   * Default props are the built-in styles your chart comes with
   * that you want to allow a user to customize. Remember, you can
   * pass in complex data here, like default d3 axes or accessor
   * functions that can get properties from your data.
   */
  defaultProps = {
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    innerRadiusCoef: 0.25,
    party: {
      getId: d => d.id,
      getSeats: d => d.seats,
    },
    circle: {
      stroke: (d) => '#fff',
      strokeWidth: 0,
      fill: (d) => scaleOrdinal(['gop', 'dem'], ['#dd1d32', '#3181c6'])(d.id),
    },
  };

  /**
   * Write all your code to draw your chart in this function!
   * Remember to use appendSelect!
   */
  draw() {
    const data = this.data();
    const props = this.props();

    const { margin, innerRadiusCoef, circle, party } = props;

    const containerDiv = this.selection().node();
    const { width: containerWidth } = containerDiv.getBoundingClientRect();

    const width = containerWidth - margin.left - margin.right;
    const height = (containerWidth / 2) - margin.top - margin.bottom;

    const outerParliamentRadius = Math.min(width / 2, height);
    const innerParliementRadius = outerParliamentRadius * innerRadiusCoef;

    const nSeats = data.reduce((a, d) => a + party.getSeats(d), 0);

    let nRows = 0;
    let maxSeatNumber = 0;
    let b = 0.5;
    const a = innerRadiusCoef / (1 - innerRadiusCoef);

    function series(s, n) { let r = 0; for (let i = 0; i <= n; i++) { r += s(i); } return r; }
    while (maxSeatNumber < nSeats) {
      nRows++;
      b += a;
      maxSeatNumber = series((i) => Math.floor(Math.PI * (b + i)), nRows - 1);
    }

    const rowWidth = (outerParliamentRadius - innerParliementRadius) / nRows;
    const seats = [];

    const seatsToRemove = maxSeatNumber - nSeats;
    for (let i = 0; i < nRows; i++) {
      const rowRadius = innerParliementRadius + rowWidth * (i + 0.5);
      const rowSeats = Math.floor(Math.PI * (b + i)) - Math.floor(seatsToRemove / nRows) - (seatsToRemove % nRows > i ? 1 : 0);
      const anglePerSeat = Math.PI / rowSeats;
      for (let j = 0; j < rowSeats; j++) {
        const s = {};
        s.polar = {
          r: rowRadius,
          theta: -Math.PI + anglePerSeat * (j + 0.5),
        };
        s.cartesian = {
          x: s.polar.r * Math.cos(s.polar.theta),
          y: s.polar.r * Math.sin(s.polar.theta),
        };
        seats.push(s);
      }
    };

    seats.sort((a, b) => a.polar.theta - b.polar.theta || b.polar.r - a.polar.r);

    let partyIndex = 0;
    let seatIndex = 0;
    seats.forEach((s) => {
      let datum = data[partyIndex];
      const nSeatsInParty = party.getSeats(datum);
      if (seatIndex >= nSeatsInParty) {
        partyIndex++;
        seatIndex = 0;
        datum = data[partyIndex];
      }
      s.party = datum;
      s.data = party.getSeats(datum);
      seatIndex++;
    });

    const container = this.selection().appendSelect('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.bottom + margin.top)
      .appendSelect('g.parliament')
      .attr('transform', `translate(${containerWidth / 2}, ${outerParliamentRadius})`);

    container.selectAll('.seat')
      .data(seats)
      .join('circle')
      .attr('class', d => `seat ${party.getId(d.party).replace(/ /g, '-')}`)
      .attr('cx', d => d.cartesian.x)
      .attr('cy', d => d.cartesian.y)
      .attr('r', d => 0.4 * rowWidth)
      .attr('fill', d => circle.fill(d.party))
      .attr('stroke', d => circle.stroke(d.party))
      .attr('stroke-width', circle.strokeWidth);

    return this; // Generally, always return the chart class from draw!
  }
}

export default ParliamentChart;
