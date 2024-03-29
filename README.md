![](./badge.svg)

# ParliamentChart

See the [demo page](https://reuters-graphics.github.io/chart-module-parliament-chart/).

### Install

```
yarn add https://github.com/reuters-graphics/chart-module-parliament-chart.git
```

### Use

```javascript
import ParliamentChart from '@reuters-graphics/parliament-chart';

const chart = new ParliamentChart();

// To create your chart, pass a selector string to the chart's selection method,
// as well as any props or data to their respective methods. Then call draw.
chart
  .selection('#chart')
  .data(yourData)
  .props(yourProps)
  .draw();

// You can call any method again to update the chart.
chart
  .data(yourNewData)
  .draw();

// Or just call the draw function alone, which is useful for resizing the chart.
chart.draw();
```

To apply this chart's default styles when using SCSS, simply define the variable `$ParliamentChart-container` to represent the ID or class of the chart's container(s) and import the `_chart.scss` partial.

```CSS
$ParliamentChart-container: '#chart';

@import '~@reuters-graphics/parliament-chart/src/scss/chart';
```

## Developing chart modules

Read more in the [DEVELOPING docs](./DEVELOPING.md) about how to write your chart module.
