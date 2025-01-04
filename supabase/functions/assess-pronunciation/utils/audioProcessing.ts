import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk@1.32.0"

export async function createAudioConfig(audioData: ArrayBuffer): Promise<sdk.AudioConfig> {
  const pushStream = sdk.AudioInputStream.createPushStream();
  
  // Write audio data in smaller chunks to prevent memory issues
  const chunkSize = 32 * 1024; // 32KB chunks
  const audioArray = new Uint8Array(audioData);
  
  for (let i = 0; i < audioArray.length; i += chunkSize) {
    const chunk = audioArray.slice(i, i + chunkSize);
    pushStream.write(chunk);
  }
  pushStream.close();

  return sdk.AudioConfig.fromStreamInput(pushStream);
}