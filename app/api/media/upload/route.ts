import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // Validate file type
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'Only images and videos allowed' }, { status: 400 })
    }

    // Validate size (5MB for images, 20MB for videos)
    const maxSize = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large (max ${isVideo ? '20MB' : '5MB'})` }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() ?? 'bin'
    const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Upload to Supabase storage
    const bucket = isImage ? 'images' : 'videos'
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filename, file, { contentType: file.type, upsert: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(data.path)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}