import { selection } from "d3-selection";
import { height, svg, state, isMobile } from "./index";
import { legendConfig } from "./legend";

import tspans from 'd3-jetpack/src/tspans';
import wordwrap from 'd3-jetpack/src/wordwrap';
import translateSelection from 'd3-jetpack/src/translate-selection';

selection.prototype.tspans = tspans;
selection.prototype.translate = translateSelection;

let titlemargin = 10;
let playerInfoEmpty;
let playerInfoTitle, playerInfo;
let selectedPlayer;

const appendPlayerInfo = data => {
  selectedPlayer = data;
  playerInfoEmpty = false;
  updateInfoBox();
  playerInfoTitle.select("text").html('');
  playerInfo.select("text").html('');

  playerInfoTitle
    .select('text')
    .at({ y: 0, dy: "1em" })
    .text(data.data.value ? state.value_prefix + data.data.value.size + state.value_suffix : "");
  playerInfo
    .select('text')
    .at({ y: -5, dy: "1em" })
    .tspans(() => {
      return wordwrap(data.data.key + " " + (data.data.value ? data.data.value.info.join(" ") : ""), isMobile ? Math.min(60, window.innerWidth / 8) : 15);
    })
    .attr('dy', (d, i) => i + 15);
}

const updateInfoBox = () => {
  var infoBoxY = isMobile ? state.margin_top : legendConfig.totalHeight + legendConfig.y + state.margin_top + titlemargin;

	playerInfoTitle.translate([legendConfig.x + state.margin_left, infoBoxY ]);
	playerInfo.translate([legendConfig.x + state.margin_left, infoBoxY + (playerInfoEmpty ? 15 : 40)]);
}

const makeInfoBox = () => {
  playerInfoEmpty = true;
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

export { appendPlayerInfo, updateInfoBox, makeInfoBox, selectedPlayer }
