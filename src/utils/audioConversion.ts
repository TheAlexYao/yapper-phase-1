export const convertToWav = async (audioBuffer: AudioBuffer): Promise<Blob> => {
  const numOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const silenceDuration = 0.1; // Reduced from 0.3 to 0.1 seconds (100ms)
  const silenceSamples = Math.floor(sampleRate * silenceDuration);
  
  // Calculate total length including silence padding
  const paddedLength = audioBuffer.length + (2 * silenceSamples);
  const length = paddedLength * numOfChannels * 2;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);
  
  // Write WAV header
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numOfChannels * 2, true);
  view.setUint16(32, numOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // Write audio data with silence padding
  const channelData = new Float32Array(paddedLength * numOfChannels);
  let offset = 44;
  
  // Add initial silence
  for (let i = 0; i < silenceSamples * numOfChannels; i++) {
    channelData[i] = 0;
  }
  
  // Copy actual audio data
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    const audioData = audioBuffer.getChannelData(i);
    channelData.set(audioData, silenceSamples + (i * audioBuffer.length));
  }
  
  // Add ending silence
  for (let i = 0; i < silenceSamples * numOfChannels; i++) {
    channelData[channelData.length - i - 1] = 0;
  }

  // Convert to 16-bit PCM with proper scaling
  for (let i = 0; i < channelData.length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }

  console.log('WAV conversion complete:', {
    sampleRate,
    numChannels: numOfChannels,
    totalLength: paddedLength,
    silencePadding: silenceSamples
  });

  return new Blob([buffer], { type: 'audio/wav' });
};

// Create a high-quality version for Azure (16kHz mono)
export const createAzureCompatibleWav = async (audioBuffer: AudioBuffer): Promise<Blob> => {
  // Create an offline audio context at 16kHz for Azure
  const offlineCtx = new OfflineAudioContext(
    1, // Force mono
    Math.ceil(audioBuffer.duration * 16000),
    16000 // Using 16kHz for Azure
  );

  // Create a buffer source
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;

  // Add a gain node to prevent clipping
  const gainNode = offlineCtx.createGain();
  gainNode.gain.value = 0.9; // Slight reduction to prevent clipping
  
  source.connect(gainNode);
  gainNode.connect(offlineCtx.destination);
  source.start();

  // Render the audio
  const renderedBuffer = await offlineCtx.startRendering();
  console.log('Rendered Azure-compatible audio:', {
    duration: renderedBuffer.duration,
    sampleRate: renderedBuffer.sampleRate,
    numberOfChannels: renderedBuffer.numberOfChannels
  });
  
  // Convert the 16kHz mono buffer to WAV
  return convertToWav(renderedBuffer);
};