import { select } from 'd3-selection';
import toWav from 'audiobuffer-to-wav';

export function renderResultAudio({ audioBuffer }) {
  var blob = new Blob([toWav(audioBuffer)]);
  var objectURL = URL.createObjectURL(blob);
  select('.result-audio-player').attr('src', objectURL);

  select('.result-audio').classed('hidden', false);
}
