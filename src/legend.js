import { selection } from "d3-selection";
import translateSelection from 'd3-jetpack/src/translate-selection';
import st from 'd3-jetpack/src/st';

import { container, isMobile, width, height, config, state, color, keys as key_values } from "./index";

selection.prototype.translate = translateSelection;
selection.prototype.st = st;

let legendConfig = {
  height: 20
};
let legendTitle, legendContainer;
let lineWidth, lineHeight;

const getLegendHeight = () => {
  legendConfig.totalHeight = !isMobile || key_values.length < 3 ? (key_values.length * legendConfig.height) + 30 : (3 * legendConfig.height) + 30;
}

const updateLegend = () => {
  legendConfig.x = isMobile ? 5 : width + state.margin_left;
  legendConfig.y = isMobile ? height : 5;

  getLegendHeight();

  lineWidth = isMobile ? width - 10 : state.margin_right - 20;
  lineHeight = legendConfig.totalHeight - 1; 

  legendTitle.attr('transform', (d, i) => {
      const height = 20;
      const x = legendConfig.x;
      const y = legendConfig.y;
      return 'translate(' + x + ',' + y + ')';
    });
  legendTitle.select("line.top").at({
    x2: lineWidth
  })

  legendTitle.select("line.bottom").at({
    x2: lineWidth,
    y1: lineHeight,
    y2: lineHeight
  });

  let keys = legendContainer
    .selectAll("g")
    .data(key_values);

  let keys_enter = keys.enter()
    .append("g")
    .at({ class: "legend" })

  keys_enter.append("rect")
    .at({
      width: 10,
      height: 10,
    })
    .translate([0, 30]);

  keys_enter.append("text")
    .at({
      x: 20,
      y: 25,
      dy: "1em"
    })
    .st({ color: '#666', fill: '#666' })

  let keys_update = keys.merge(keys_enter);

  keys_update.attr('transform', (d, i) => {
    const col = Math.floor(i / 3);
    const row = i - (col * 3);
    const leftmargin = isMobile ? col * 120 : 0;
    const topmargin = isMobile ? row * legendConfig.height : i * legendConfig.height;
    const x = leftmargin + legendConfig.x;
    const y = legendConfig.y + topmargin;
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
    .at({ x: 0, y: 5, dy: "0.8em" })
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

export { makeLegend, updateLegend, legendConfig, totalLegendHeight, getLegendHeight }