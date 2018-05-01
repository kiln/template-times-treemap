import { selection } from "d3-selection";
import translateSelection from 'd3-jetpack/src/translate-selection';
import st from 'd3-jetpack/src/st';

import { container, isMobile, width, height, config, state, color, keys as key_values } from "./index";

selection.prototype.translate = translateSelection;
selection.prototype.st = st;

let legendConfig;
let legendTitle, legendContainer;
let lineWidth, lineHeight;

const updateLegend = () => {
  legendConfig = {
    x: isMobile ? state.margin_left : width + state.margin_left,
    y: isMobile ? height : 5,
    height: 20,
  };

  lineWidth = config.width < 400 ? width - 20 : 100;
  lineHeight = config.width < 400 ? 90 : 110;

  legendTitle.attr('transform', (d, i) => {
      const height = 20;
      const x = legendConfig.x;
      const y = i * height + legendConfig.y;
      return 'translate(' + x + ',' + y + ')';
    });
  legendTitle.select("line.top").at({
    x2: lineWidth
  })

  legendTitle.select("line.bottom").at({
    x2: lineWidth,
    y1: lineHeight,
    y2: lineHeight
  })

  let keys = legendContainer
    .selectAll("g")
    .data(key_values);

  let keys_enter = keys.enter()
    .append("g")
    .at({ class: "legend" })
    .attr('transform', (d, i) => {
      const x = state.margin_left + legendConfig.x;
      const y = i * legendConfig.height + legendConfig.y + state.margin_top;
      return 'translate(' + x + ',' + y + ')';
    });

  keys_enter.append("rect")
    .at({
      width: 10,
      height: 10,
    })
    .translate([0, 30]);

  keys_enter.append("text")
    .at({
      x: 20,
      y: 40,
    })
    .st({ color: '#666', fill: '#666' })

  let keys_update = keys.merge(keys_enter);

  keys_update.attr('transform', (d, i) => {
    const leftmargin = 0;
    const topmargin = 0;
    const x = leftmargin + legendConfig.x;
    const y = i * legendConfig.height + legendConfig.y + topmargin;
    return 'translate(' + x + ',' + y + ')';
  });

  keys_update.select("text").text(d => d);
  keys_update.select("rect").st({
      fill: d => color(d),
      stroke: d => color(d),
    });
  keys.exit().remove();

}

const makeLegend = () => {
  // Create a legend element
  legendContainer = container
    .append('g')
    .at({ class: 'legendContainer' })

  legendTitle = container
    .append('g')
    .at({ class: 'legendTitle' })

  legendTitle
    .append('text')
    .at({ x: 0, y: 20 })
    .text('Key');

  legendTitle.append('line').at({
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
    strokeWidth: 2,
    stroke: '#ddd',
    class: 'top'
  });
  legendTitle.append('line').at({
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
    strokeWidth: 2,
    stroke: '#ddd',
    class: 'bottom'
  });
};

export { makeLegend, updateLegend, legendConfig }