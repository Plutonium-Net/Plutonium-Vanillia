import { relayVanillia } from '../bridge/vanillia-relay.mjs'

const SERVERS = {
  vercel: 'https://vanillia-vercel.plutoniumnet.work',
  'us-west': 'https://vanillia-us-west.plutoniumnet.work',
  europe: 'https://vanillia-europe.plutoniumnet.work'
}

export async function GET(request) {
  return proxy(request)
}

export async function POST(request) {
  return proxy(request)
}

export async function HEAD(request) {
  return proxy(request)
}

async function proxy(request) {
  const url = new URL(request.url)

  const target = url.searchParams.get('url')
  const serverId = url.searchParams.get('server') || 'vercel'

  if (!target) {
    return new Response('Missing url parameter.', {
      status: 400,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store'
      }
    })
  }

  if (!Object.hasOwn(SERVERS, serverId)) {
    return new Response('Unknown Vanillia server.', {
      status: 400,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store'
      }
    })
  }

  try {
    const targetUrl = new URL(target)

    if (
      !['http:', 'https:'].includes(targetUrl.protocol) ||
      targetUrl.username ||
      targetUrl.password
    ) {
      throw new Error()
    }
  } catch {
    return new Response('Invalid target URL.', {
      status: 400,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store'
      }
    })
  }

  const relayUrl = new URL(
    `/vanillia-embed/${serverId}/vanillia`,
    url.origin
  )

  relayUrl.searchParams.set('url', target)

  const relayRequest = new Request(relayUrl, {
    method: request.method,
    headers: request.headers,
    body:
      request.method === 'POST'
        ? await request.arrayBuffer()
        : undefined
  })

  const response = await relayVanillia(relayRequest)

  const headers = new Headers(response.headers)

  headers.delete('x-frame-options')
  headers.delete('X-Frame-Options')

  headers.delete('content-security-policy')
  headers.delete('Content-Security-Policy')

  headers.delete('content-security-policy-report-only')
  headers.delete('Content-Security-Policy-Report-Only')

  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS')
  headers.set('Access-Control-Allow-Headers', '*')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    }
  })
}
