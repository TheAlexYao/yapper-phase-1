interface WavHeader {
  chunkID: string;
  fileSize: number;
  format: string;
  subchunk1ID: string;
  audioFormat: number;
  numChannels: number;
  sampleRate: number;
  byteRate: number;
  blockAlign: number;
  bitsPerSample: number;
}

export function validateAndProcessWavFile(arrayBuffer: ArrayBuffer): { 
  isValid: boolean; 
  pcmData?: Uint8Array; 
  header?: WavHeader;
  error?: string;
} {
  try {
    const wavBuffer = new Uint8Array(arrayBuffer);
    const header = parseWavHeader(wavBuffer);
    
    // Validate WAV format
    if (!isValidWavFormat(header)) {
      return { 
        isValid: false, 
        error: 'Invalid WAV format. Required: PCM, 16-bit, mono/stereo, 16kHz-48kHz' 
      };
    }

    // Extract PCM data (skip WAV header)
    const pcmData = wavBuffer.slice(44);
    
    console.log('WAV file validated successfully:', {
      format: header.format,
      channels: header.numChannels,
      sampleRate: header.sampleRate,
      bitsPerSample: header.bitsPerSample,
      pcmDataSize: pcmData.length
    });

    return { isValid: true, pcmData, header };
  } catch (error) {
    console.error('Error processing WAV file:', error);
    return { isValid: false, error: error.message };
  }
}

function parseWavHeader(wavBuffer: Uint8Array): WavHeader {
  const dataView = new DataView(wavBuffer.buffer);
  
  return {
    chunkID: new TextDecoder().decode(wavBuffer.slice(0, 4)),
    fileSize: dataView.getUint32(4, true),
    format: new TextDecoder().decode(wavBuffer.slice(8, 12)),
    subchunk1ID: new TextDecoder().decode(wavBuffer.slice(12, 16)),
    audioFormat: dataView.getUint16(20, true),
    numChannels: dataView.getUint16(22, true),
    sampleRate: dataView.getUint32(24, true),
    byteRate: dataView.getUint32(28, true),
    blockAlign: dataView.getUint16(32, true),
    bitsPerSample: dataView.getUint16(34, true)
  };
}

function isValidWavFormat(header: WavHeader): boolean {
  // Validate WAV format requirements
  const isValidFormat = 
    header.chunkID === 'RIFF' &&
    header.format === 'WAVE' &&
    header.subchunk1ID === 'fmt ' &&
    header.audioFormat === 1 && // PCM
    (header.numChannels === 1 || header.numChannels === 2) && // Mono or Stereo
    header.bitsPerSample === 16 && // 16-bit
    header.sampleRate >= 16000 && header.sampleRate <= 48000; // 16kHz-48kHz

  console.log('WAV format validation:', {
    header,
    isValidFormat,
    validationDetails: {
      hasRiffHeader: header.chunkID === 'RIFF',
      isWaveFormat: header.format === 'WAVE',
      hasFmtChunk: header.subchunk1ID === 'fmt ',
      isPcm: header.audioFormat === 1,
      validChannels: header.numChannels === 1 || header.numChannels === 2,
      valid16Bit: header.bitsPerSample === 16,
      validSampleRate: header.sampleRate >= 16000 && header.sampleRate <= 48000
    }
  });

  return isValidFormat;
}