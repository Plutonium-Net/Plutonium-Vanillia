import { relayVanillia } from '../bridge/vanillia-relay.mjs'

export default {
  async fetch(request) {
    const url = new URL(request.url)

    const server = url.searchParams.get('server') || 'vercel'
    const target = url.searchParams.get('url')

    if (!target) {
      return new Response('Missing url parameter.', {
        status: 400,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'no-store'
        }
      })
    }

    const relayUrl = new URL(
      `/vanillia-embed/${encodeURIComponent(server)}/vanillia`,
      url.origin
    )

    relayUrl.searchParams.set('url', target)

    const relayRequest = new Request(relayUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method === 'POST' ? await request.arrayBuffer() : undefined
    })

    return relayVanillia(relayRequest)
  }
}
