import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

export async function uploadAudioToStorage(audioFile: File): Promise<string> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const fileName = `${crypto.randomUUID()}.wav`
  const filePath = `recordings/${fileName}`

  const { data, error } = await supabase.storage
    .from('audio')
    .upload(filePath, audioFile, {
      contentType: 'audio/wav',
      upsert: false
    })

  if (error) {
    console.error('Error uploading audio:', error)
    throw new Error('Failed to upload audio file')
  }

  const { data: { publicUrl } } = supabase.storage
    .from('audio')
    .getPublicUrl(filePath)

  return publicUrl
}