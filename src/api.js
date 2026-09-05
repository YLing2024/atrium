const API_BASE = '/api/blog'

async function getJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

export function fetchPosts() {
  return getJSON(`${API_BASE}/posts`).then((data) => data.list || [])
}

export async function fetchPost(slug) {
  const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(slug)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

export function getCollections() {
  return getJSON(`${API_BASE}/collections`).then((data) => data.list || [])
}

export async function getCollection(slug) {
  const res = await fetch(`${API_BASE}/collections/${encodeURIComponent(slug)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}
