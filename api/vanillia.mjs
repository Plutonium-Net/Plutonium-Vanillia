import { relayVanillia, VANILLIA_EMBED_PREFIX } from '../bridge/vanillia-relay.mjs'

export default {
  fetch(request) {
    const url = new URL(request.url)
    if (!url.pathname.startsWith(VANILLIA_EMBED_PREFIX)) {
      url.pathname = VANILLIA_EMBED_PREFIX + (url.searchParams.get('__path') || '').replace(/^\/+/, '')
    }
    url.searchParams.delete('__path')
    return relayVanillia(new Request(url, request))
  },
}
