'use strict';

require('d3-transition');
var d3 = require('d3-selection');
var d3Appendselect = require('d3-appendselect');
var lodashEs = require('lodash-es');
var d3Scale = require('d3-scale');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

d3.selection.prototype.appendSelect = d3Appendselect.appendSelect;
/**
 * Write your chart as a class with a single draw method that draws
 * your chart! This component inherits from a base class you can
 * see and customize in the baseClasses folder.
 */

var ParliamentChart = /*#__PURE__*/function () {
  function ParliamentChart() {
    _classCallCheck(this, ParliamentChart);

    _defineProperty(this, "defaultData", [{
      id: 'gop',
      seats: 211
    }, {
      id: 'dem',
      seats: 221
    }]);

    _defineProperty(this, "defaultProps", {
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      innerRadiusCoef: 0.25,
      party: {
        getId: function getId(d) {
          return d.id;
        },
        getSeats: function getSeats(d) {
          return d.seats;
        }
      },
      circle: {
        stroke: function stroke(d) {
          return '#fff';
        },
        strokeWidth: 0,
        fill: function fill(d) {
          return d3Scale.scaleOrdinal(['gop', 'dem'], ['#dd1d32', '#3181c6'])(d.id);
        }
      }
    });
  }

  _createClass(ParliamentChart, [{
    key: "selection",
    value: function selection(selector) {
      if (!selector) return this._selection;
      this._selection = d3.select(selector);
      return this;
    }
  }, {
    key: "data",
    value: function data(newData) {
      if (!newData) return this._data || this.defaultData;
      this._data = newData;
      return this;
    }
  }, {
    key: "props",
    value: function props(newProps) {
      if (!newProps) return this._props || this.defaultProps;
      this._props = lodashEs.merge(this._props || this.defaultProps, newProps);
      return this;
    }
    /**
     * Default data for your chart. Generally, it's NOT a good idea to import
     * a big dataset and assign it here b/c it'll make your component quite
     * large in terms of file size. At minimum, though, you should assign an
     * empty Array or Object, depending on what your chart expects.
     */

  }, {
    key: "draw",

    /**
     * Write all your code to draw your chart in this function!
     * Remember to use appendSelect!
     */
    value: function draw() {
      var data = this.data();
      var props = this.props();
      var margin = props.margin,
          innerRadiusCoef = props.innerRadiusCoef,
          circle = props.circle,
          party = props.party;
      var containerDiv = this.selection().node();

      var _containerDiv$getBoun = containerDiv.getBoundingClientRect(),
          containerWidth = _containerDiv$getBoun.width;

      var width = containerWidth - margin.left - margin.right;
      var height = containerWidth / 2 - margin.top - margin.bottom;
      var outerParliamentRadius = Math.min(width / 2, height);
      var innerParliementRadius = outerParliamentRadius * innerRadiusCoef;
      var nSeats = data.reduce(function (a, d) {
        return a + party.getSeats(d);
      }, 0);
      var nRows = 0;
      var maxSeatNumber = 0;
      var b = 0.5;
      var a = innerRadiusCoef / (1 - innerRadiusCoef);

      function series(s, n) {
        var r = 0;

        for (var i = 0; i <= n; i++) {
          r += s(i);
        }

        return r;
      }

      while (maxSeatNumber < nSeats) {
        nRows++;
        b += a;
        maxSeatNumber = series(function (i) {
          return Math.floor(Math.PI * (b + i));
        }, nRows - 1);
      }

      var rowWidth = (outerParliamentRadius - innerParliementRadius) / nRows;
      var seats = [];
      var seatsToRemove = maxSeatNumber - nSeats;

      for (var i = 0; i < nRows; i++) {
        var rowRadius = innerParliementRadius + rowWidth * (i + 0.5);
        var rowSeats = Math.floor(Math.PI * (b + i)) - Math.floor(seatsToRemove / nRows) - (seatsToRemove % nRows > i ? 1 : 0);
        var anglePerSeat = Math.PI / rowSeats;

        for (var j = 0; j < rowSeats; j++) {
          var s = {};
          s.polar = {
            r: rowRadius,
            theta: -Math.PI + anglePerSeat * (j + 0.5)
          };
          s.cartesian = {
            x: s.polar.r * Math.cos(s.polar.theta),
            y: s.polar.r * Math.sin(s.polar.theta)
          };
          seats.push(s);
        }
      }
      seats.sort(function (a, b) {
        return a.polar.theta - b.polar.theta || b.polar.r - a.polar.r;
      });
      var partyIndex = 0;
      var seatIndex = 0;
      seats.forEach(function (s) {
        var datum = data[partyIndex];
        var nSeatsInParty = party.getSeats(datum);

        if (seatIndex >= nSeatsInParty) {
          partyIndex++;
          seatIndex = 0;
          datum = data[partyIndex];
        }

        s.party = datum;
        s.data = party.getSeats(datum);
        seatIndex++;
      });
      var container = this.selection().appendSelect('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.bottom + margin.top).appendSelect('g.parliament').attr('transform', "translate(".concat(containerWidth / 2, ", ").concat(outerParliamentRadius, ")"));
      container.selectAll('.seat').data(seats).join('circle').attr('class', function (d) {
        return "seat ".concat(party.getId(d.party).replace(/ /g, '-'));
      }).attr('cx', function (d) {
        return d.cartesian.x;
      }).attr('cy', function (d) {
        return d.cartesian.y;
      }).attr('r', function (d) {
        return 0.4 * rowWidth;
      }).attr('fill', function (d) {
        return circle.fill(d.party);
      }).attr('stroke', function (d) {
        return circle.stroke(d.party);
      }).attr('stroke-width', circle.strokeWidth);
      return this; // Generally, always return the chart class from draw!
    }
  }]);

  return ParliamentChart;
}();

module.exports = ParliamentChart;
