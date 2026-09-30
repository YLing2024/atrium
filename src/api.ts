// 后端 API 的返回体形状 —— 按前台实际消费到的字段声明（只读，与后端契约对齐）
export interface PostCollectionRef {
  id: string | number
  name: string
  public_id?: string | null
  slug?: string | null
}

export interface BlogPostSummary {
  id: string | number
  title: string
  excerpt?: string | null
  tags?: string[] | null
  created_at?: string | null
  public_id?: string | null
  slug?: string | null
  collection?: PostCollectionRef | null
}

export interface BlogPostDetail extends BlogPostSummary {
  content?: string | null
  subtitle?: string | null
  published?: boolean | null
}

export interface BlogCollection {
  id: string | number
  name: string
  description?: string | null
  post_count?: number | null
  public_id?: string | null
  slug?: string | null
}

export interface BlogCollectionDetail extends BlogCollection {
  posts: BlogPostSummary[]
}

interface ListResponse<T> {
  list?: T[] | null
}

const API_BASE = '/api/blog'

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<T>
}

export function fetchPosts(): Promise<BlogPostSummary[]> {
  return getJSON<ListResponse<BlogPostSummary>>(`${API_BASE}/posts`).then(
    (data) => data.list || [],
  )
}

export async function fetchPost(slug: string): Promise<BlogPostDetail | null> {
  // 草稿预览：后台点标题会带 ?preview=<短时效令牌>，服务端校验后才放行未发布文章
  const preview = new URLSearchParams(window.location.search).get('preview')
  const qs = preview ? `?preview=${encodeURIComponent(preview)}` : ''
  const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(slug)}${qs}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<BlogPostDetail>
}

export function getCollections(): Promise<BlogCollection[]> {
  return getJSON<ListResponse<BlogCollection>>(`${API_BASE}/collections`).then(
    (data) => data.list || [],
  )
}

export async function getCollection(slug: string): Promise<BlogCollectionDetail | null> {
  const res = await fetch(`${API_BASE}/collections/${encodeURIComponent(slug)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<BlogCollectionDetail>
}
