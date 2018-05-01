import { selection } from "d3-selection";
import { height, svg, state } from "./index";
import { legendConfig } from "./legend";

import tspans from 'd3-jetpack/src/tspans';
import wordwrap from 'd3-jetpack/src/wordwrap';
import translateSelection from 'd3-jetpack/src/translate-selection';

selection.prototype.tspans = tspans;
selection.prototype.translate = translateSelection;

let titlemargin = 30;
let playerInfoTitle, playerInfo;

const appendPlayerInfo = data => {
  playerInfoTitle.select("text").html('');
  playerInfo.select("text").html('');

  playerInfoTitle
    .select('text')
    .at({ y: 0 })
    .text(data.data.value ? state.value_prefix + data.data.value.size + state.value_suffix : "");
  playerInfo
    .select('text')
    .at({ y: -25 })
    .tspans(() => {
      return wordwrap(data.data.key + " " + (data.data.value ? data.data.value.info.join(" ") : ""), 15);
    })
    .attr('dy', (d, i) => i + 15);
}

const updateInfoBox = () => {
	playerInfoTitle.translate([legendConfig.x + state.margin_left, height * 0.3 + titlemargin]);
	playerInfo.translate([legendConfig.x + state.margin_left, height * 0.3 + titlemargin + 30]);
}

const makeInfoBox = () => {
  playerInfoTitle = svg
    .append('g')
    .attr('class', 'playerInfoTitle');

  playerInfoTitle
    .append('text')
    .attr('x', 0).attr('y', 0);

  playerInfo = svg
  .append('g')
  .attr('class', 'playerInfo')

  playerInfo
    .append('text')
    .at({
      class: 'playerInfo',
      x: 0,
      y: 10,
    })
    .tspans(() => wordwrap('Tap an area for more information', 20));
}

export { appendPlayerInfo, updateInfoBox, makeInfoBox }
