export function riffleBuffers({
  ctx,
  audioBuffers,
  preserveTempo = false,
  samplesPerChunk = 1,
}) {
  const numBufs = audioBuffers.length;
  const longestBufferLength = audioBuffers
    .map((b) => b.length)
    .reduce((x, y) => (x > y ? x : y), 0);
  const combinedBufferLength = preserveTempo
    ? longestBufferLength
    : longestBufferLength * numBufs;

  var dest0 = new Float32Array(combinedBufferLength);
  var dest1 = new Float32Array(combinedBufferLength);
  // TODO: Make sure all sampleRates are the same.

  // TODO: Handle variable buffer lengths.
  for (let i = 0; i < numBufs; ++i) {
    let buffer = audioBuffers[i];
    let data0 = buffer.getChannelData(0);
    let data1;
    if (buffer.numberOfChannels === 2) {
      data1 = buffer.getChannelData(1);
    }

    if (preserveTempo) {
      for (
        let j = i * samplesPerChunk;
        j < buffer.length;
        j += numBufs * samplesPerChunk
      ) {
        for (let k = 0; k < samplesPerChunk; ++k) {
          const index = j + k;
          writeToDestArrays(data0, data1, index, index);
        }
      }
    } else {
      for (let j = 0; j < buffer.length; ++j) {
        const chunkIndex = ~~(j / samplesPerChunk);
        const blockIndex = chunkIndex * numBufs;
        const offset = j % samplesPerChunk;
        const destIndex = (i + blockIndex) * samplesPerChunk + offset;
        writeToDestArrays(data0, data1, j, destIndex);
      }
    }
  }

  let combinedBuffer = ctx.createBuffer(
    2,
    combinedBufferLength,
    audioBuffers[0].sampleRate
  );

  if (typeof combinedBuffer.copyToChannel === 'function') {
    combinedBuffer.copyToChannel(dest0, 0, 0);
    combinedBuffer.copyToChannel(dest1, 1, 0);
    return combinedBuffer;
  } else {
    throw new Error('TODO: copyToChannel polyfill');
  }

  function writeToDestArrays(data0, data1, srcIndex, destIndex) {
    if (destIndex < combinedBufferLength) {
      dest0[destIndex] = data0[srcIndex];
      if (data1 !== undefined) {
        dest1[destIndex] = data1[srcIndex];
      }
    }
  }
}
