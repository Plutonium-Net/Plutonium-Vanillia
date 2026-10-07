import { relayVanillia } from '../bridge/vanillia-relay.mjs'

export async function GET(request) {
  return handle(request)
}

export async function POST(request) {
  return handle(request)
}

export async function HEAD(request) {
  return handle(request)
}

async function handle(request) {
  const url = new URL(request.url)
  const target = url.searchParams.get('url')
  const server = url.searchParams.get('server') || 'vercel'

  if (!target) {
    return new Response('Missing url parameter.', {
      status: 400,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    })
  }

  if (!['vercel', 'us-west', 'europe'].includes(server)) {
    return new Response('Unknown Vanillia server.', {
      status: 400,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    })
  }

  const relayUrl = new URL(
    `/vanillia-embed/${server}/vanillia`,
    url.origin
  )

  relayUrl.searchParams.set('url', target)

  const headers = new Headers(request.headers)

  const relayRequest = new Request(relayUrl, {
    method: request.method,
    headers,
    body:
      request.method === 'POST'
        ? await request.arrayBuffer()
        : undefined
  })

  return relayVanillia(relayRequest)
}
