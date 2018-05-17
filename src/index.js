import pym from "pym.js";
import { select, selectAll, selection } from "d3-selection";
import { scaleOrdinal } from "d3-scale";
import { nest } from "d3-collection";
import { treemap, treemapResquarify, hierarchy } from "d3-hierarchy";
import { transition } from "d3-transition";

import at from 'd3-jetpack/src/at';
import translateSelection from 'd3-jetpack/src/translate-selection';

import { appendPlayerInfo, makeInfoBox, updateInfoBox } from "./infoBox";
import { makeLegend, updateLegend, legendConfig, getLegendHeight } from "./legend";

selection.prototype.at = at;
selection.prototype.translate = translateSelection;

let config = { width: 700, height: 450, mobileWidth: 300, mobileHeight: 550 };
let isMobile, width, height;
let layout, container;
let processedData;

const svg = select('#times-treemap');

let timesColors;
const color = scaleOrdinal(timesColors);
let keys;

new pym.Child();

export var data = {};

export var state = {
  colors: 'standard',
  colors_custom: '',
  text_color: '#ffffff',

  fluid_width: true,

  margin_auto: true,
  margin_top: 10,
  margin_left: 10,
  margin_right: 150,
  margin_bottom: 10,
  margin_mobileRight: 10,
  margin_mobileBottom: 100,
  margin_mobileTop: 70,
  aspect_ratio: 0.65,
  aspect_ratioMobile: 1.15,

  padding_inner: 2,
  padding_outer: 1,

  value_prefix: "£",
  value_suffix: "m"
};

export function update() {
  processData();
  isMobile = window.innerWidth < 600 ? true : false;
  updateColors();
  getLegendHeight();
  updateSize();
  updateLegend();
  updateInfoBox();

  svg.at({
    width: isMobile ? config.mobileWidth : config.width,
    height: isMobile ? config.mobileWidth * state.aspect_ratioMobile : config.width * state.aspect_ratio,
  })

  container.translate([state.margin_left, state.margin_top + (isMobile ? state.margin_mobileTop : 0)])

  layout = treemap()
    .size([width, height])
    .tile(treemapResquarify)
    .round(true)
    .paddingOuter(state.padding_inner)
    .paddingInner(state.padding_outer);

  let root = hierarchy({key: "players", values: processedData}, function(d) { return d.values })
    .eachBefore(
      d => {
        (d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.key )
      }
    )
    .sum(sumBySize)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  layout(root);

  const cells = container.selectAll('.cell').data(root.leaves());

  // Entering cells
  const cells_enter = cells.enter()
    .append('g').at({ "class" : "cell" })
    .on('mouseover', function() {
      var _this = this;
      selectAll('.cell')
        .transition()
        .duration(100)
        .style('opacity', function() {
          return this === _this ? 1.0 : 0.6;
        });
    })
    .on('mouseout', function() {
      selectAll('.cell')
        .transition()
        .duration(500)
        .style('opacity', 1);
    })
    .on('click', function(d) {
      appendPlayerInfo(d);
    });

  cells_enter
    .append('rect');

  cells_enter
    .append('text')
    .append('tspan')
    .at({
      x: 8,
      y: 0,
      dy: '1.2em',
      class: 'playerNames',
    })

  cells_enter
    .append('text')
    .append('tspan')
    .at({
      x: 8,
      y: 12,
      dy: '1.6em',
      class: 'playerNamesFee',
    })

  // Removing cells
  cells.exit().remove();
  
  // Updating cells
  const cells_update = cells.merge(cells_enter);
  
  cells_update.translate(d => [d.x0, d.y0]);
  cells_update.select("rect")
    .at({
      id: d => d.data.id,
      class: d => (d.x1 - d.x0 > 120 && d.y1 - d.y0 > 40 ? 'wide' : null),
      width: d => d.x1 - d.x0,
      height: d => d.y1 - d.y0,
      fill: d => color(d.parent ? d.parent.data.key : "players"),
    })

  cells_update.select(".playerNames")
    .style("fill", state.colors == "custom" ? state.text_color : "#ffffff")
    .text(function(d) {
      // Only display text if sibling <rect> element is wide enough
      const parentRect = this.parentNode.previousElementSibling;
      if (select(parentRect).classed('wide')) {;
        return d.data.key;
      }
    });
  cells_update.select(".playerNamesFee")
    .style("fill", state.colors == "custom" ? state.text_color : "#ffffff")
    .text(function(d) {
      // Only display text if sibling <rect> element is wide enough
      const parentRect = this.parentNode.parentNode.firstElementChild;
      if (select(parentRect).classed('wide')) {
        if (!d.data.value) return "";
        else return state.value_prefix + d.data.value.size + state.value_suffix;
      }
    });
    if (typeof Flourish.setHeight == 'function') { 
     Flourish.setHeight(svg.node().getBoundingClientRect().height);
   }
}

export function draw() {
  layout = treemap().round(true);
  container = svg.append('g').at({ class: 'container' });
  makeInfoBox();
  makeLegend();
  
  update();
  window.onresize = function() {
    update();
  }
}

const processData = () => {
  let nestColumns = data.data.column_names.nest;
  let nested = nest();

  nestColumns.forEach(function(column, i) {
    nested.key(function(d) { return d.nest[i] });
  })

  nested = nested.rollup(function(d) { 
    return {
      size: +d[0].size,
      info: d[0].info
    }
  });
 
  processedData = nested.entries(data.data);
}

const updateSize = () => {
  config.width = state.fluid_width ? window.innerWidth : 700;
  config.mobileWidth = state.fluid_width ? window.innerWidth : 300;

  width = isMobile
    ? config.mobileWidth - state.margin_left - state.margin_mobileRight
    : config.width - state.margin_left - state.margin_right,
  
  height = isMobile
    ? (config.mobileWidth * state.aspect_ratioMobile) - state.margin_top - (state.margin_auto ? legendConfig.totalHeight : state.margin_mobileBottom) - state.margin_mobileTop
    : (config.width * state.aspect_ratio) - state.margin_top - state.margin_bottom;
}

const updateColors = () => {
  keys = [];
  timesColors = state.colors == "standard" ? ['#254251', '#E0AB26', '#F37F2F', '#3292A6', '#6c3c5e'] : state.colors_custom.replace(/ /g, "").split(",");

  data.data.map(function(player) {
    let val = player.nest.length > 1 ? player.nest[player.nest.length - 2] : "players";
    if (keys.indexOf(val) < 0) keys.push(val);
  })

  color
    .range(timesColors)
    .domain(keys);
}

const sumBySize = d => {
  return d.value ? (isNaN(d.value.size) ? 0 : d.value.size) : undefined;
}

export { svg, container, width, height, isMobile, config, color, keys };
