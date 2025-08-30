/**
 * Minimal CORS helper for CauciónBTC API
 * Configured for same-origin requests only in MVP
 */

export function setCorsHeaders(headers: Headers) {
  headers.set("Access-Control-Allow-Origin", "same-origin")
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  headers.set("Access-Control-Max-Age", "86400")
}

export function handleCors(request: Request) {
  const headers = new Headers()
  setCorsHeaders(headers)

  // Handle preflight OPTIONS request
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers })
  }

  return headers
}

export function createCorsResponse(data: any, status = 200) {
  const headers = new Headers({ "Content-Type": "application/json" })
  setCorsHeaders(headers)

  return new Response(JSON.stringify(data), { status, headers })
}
