import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { performSpeechRecognition } from "./utils/speechRecognition.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Received pronunciation assessment request");
    const { audioData, referenceText } = await req.json();

    if (!audioData || !referenceText) {
      console.error("Missing required parameters");
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing audio data for text:", referenceText);
    
    // Convert base64 to ArrayBuffer
    const binaryString = atob(audioData.split(',')[1]);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log("Audio data converted, starting speech recognition");
    const result = await performSpeechRecognition(bytes.buffer, referenceText);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in pronunciation assessment:", error);
    return new Response(
      JSON.stringify({ error: error.message, details: error.stack }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});