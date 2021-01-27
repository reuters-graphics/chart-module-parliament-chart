<!-- ⭐ Write an interactive DEMO of your chart in this component.
Follow the notes below! -->
<script>
  export let responsive; // eslint-disable-line
  import { afterUpdate } from 'svelte';
  import Docs from './App/Docs.svelte';
  import Explorer from './App/Explorer.svelte';
  import ParliamentChart from '../js/index';
  import USHouse from './data/us-house';
  import UKParliament from './data/uk-parliament';
  import { scaleOrdinal } from 'd3-scale';

  let chart = new ParliamentChart();
  let chartContainer;


  const usScale = d => scaleOrdinal(['gop', 'dem'], ['#dd1d32', '#3181c6'])(d.id);
  const ukScale = d => d.colour;

  let circleFill = usScale;
  // ...

  // 🎈 Tie your custom props back together into one chartProps object.
  $: chartProps = { circle: { fill: circleFill }};

  let chartData = USHouse;

  afterUpdate(() => {
    // 💪 Create a new chart instance of your module.
    chart = new ParliamentChart();
    // ⚡ And let's use your chart!
    chart
      .selection(chartContainer)
      .data(chartData) // Pass your chartData
      .props(chartProps) // Pass your chartProps
      .draw(); // 🚀 DRAW IT!
  });
</script>

<!-- 🖌️ Style your demo page here -->
<style lang="scss">
  .chart-options {
    button {
      padding: 5px 15px;
    }
  }
</style>

<div id="parliament-chart-container" bind:this={chartContainer} />

<div class="chart-options">
  <!-- ✏️ Create buttons that update your data/props variables when they're clicked! -->
  <button
    on:click={() => {
      chartData = USHouse;
      circleFill = usScale;
    }}>U.S. House</button>
  <button
    on:click={() => {
      chartData = UKParliament;
      circleFill = ukScale;
    }}>U.K. Parliament</button>
</div>

<!-- ⚙️ These components will automatically create interactive documentation for you chart! -->
<Docs />
<Explorer title='Data' data={chart.data()} />
<Explorer title='Props' data={chart.props()} />
