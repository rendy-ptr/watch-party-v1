import { NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const room = url.searchParams.get('room')
  const uid = url.searchParams.get('uid')

  if (!room || !uid) {
    return NextResponse.json(
      { error: 'room and uid required' },
      { status: 400 },
    )
  }

  // pakai key & secret dari .env
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity: uid },
  )
  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true })

  const token = await at.toJwt()
  return NextResponse.json({ token })
}
