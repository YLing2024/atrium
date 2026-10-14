// 设计令牌一致性校验（零依赖）。
// 从 src/index.css 解析核心令牌（深浅两套），与脚本内的基准值表比对；
// 任一不一致（或深浅两个暗色块互相不一致）即打印差异并非 0 退出。
// 用途：防止同一组颜色在多个仓库里悄悄漂移。不引入共享包、不上 monorepo。
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const CSS_PATH = fileURLToPath(new URL('../src/index.css', import.meta.url))

// 核心令牌 —— 基准值取自本仓库现行 index.css（改动令牌须同步改这里，否则校验失败）
const TOKENS = ['--bg', '--surface', '--fg', '--muted', '--line', '--accent']

const BASELINE = {
  light: {
    '--bg': '#f7f6f3',
    '--surface': '#fbfaf8',
    '--fg': '#171512',
    '--muted': '#6f6a63',
    '--line': 'rgba(23,21,18,0.16)',
    '--accent': '#a05b0c',
  },
  dark: {
    '--bg': '#13110f',
    '--surface': '#191715',
    '--fg': '#efeae3',
    '--muted': '#a29b92',
    '--line': 'rgba(239,234,227,0.16)',
    '--accent': '#c77c1f',
  },
}

const SELECTORS = {
  light: /:root\s*\{/,
  // 暗色的两个来源必须一致：系统偏好 + 显式 data-theme
  darkMedia: /:root:not\(\[data-theme="light"\]\)\s*\{/,
  darkAttr: /:root\[data-theme="dark"\]\s*\{/,
}

// 取出 selector 对应的声明块（花括号配平；先剥注释避免块内 `{}` 干扰）
function findBlock(css, selectorRe) {
  const match = selectorRe.exec(css)
  if (!match) return null
  const start = css.indexOf('{', match.index)
  if (start === -1) return null
  let depth = 0
  for (let i = start; i < css.length; i += 1) {
    const ch = css[i]
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return css.slice(start + 1, i)
    }
  }
  return null
}

// 从声明块解析需要的令牌；值做归一化（去空白、转小写）后比较
function parseTokens(block) {
  const out = {}
  if (!block) return out
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g
  let m
  while ((m = re.exec(block)) !== null) {
    const name = m[1]
    if (!TOKENS.includes(name)) continue
    out[name] = m[2].trim().replace(/\s+/g, '').toLowerCase()
  }
  return out
}

function diffSet(actual, expected) {
  const problems = []
  for (const name of TOKENS) {
    const a = actual[name] ?? null
    const e = expected[name]
    if (a !== e) problems.push({ name, expected: e, actual: a })
  }
  return problems
}

function describe(problems) {
  return problems
    .map(({ name, expected, actual }) => `  ${name}: 期望 ${expected} / 实际 ${actual ?? '(缺失)'}`)
    .join('\n')
}

function main() {
  let css
  try {
    css = readFileSync(CSS_PATH, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  } catch (err) {
    console.error(`读取令牌文件失败：${CSS_PATH}\n${err.message}`)
    process.exit(1)
  }

  const light = parseTokens(findBlock(css, SELECTORS.light))
  const darkMedia = parseTokens(findBlock(css, SELECTORS.darkMedia))
  const darkAttr = parseTokens(findBlock(css, SELECTORS.darkAttr))

  let failed = false

  if (!Object.keys(light).length) {
    console.error('未在 :root 中找到任何核心令牌')
    failed = true
  }
  if (!Object.keys(darkMedia).length && !Object.keys(darkAttr).length) {
    console.error('未找到暗色令牌（@media 或 data-theme 均缺失）')
    failed = true
  }

  const lightDiff = diffSet(light, BASELINE.light)
  if (lightDiff.length) {
    console.error('浅色令牌与基准不一致：')
    console.error(describe(lightDiff))
    failed = true
  }

  // 两个暗色来源都要对基准一致
  if (Object.keys(darkMedia).length) {
    const dmDiff = diffSet(darkMedia, BASELINE.dark)
    if (dmDiff.length) {
      console.error('@media 暗色令牌与基准不一致：')
      console.error(describe(dmDiff))
      failed = true
    }
  }

  if (Object.keys(darkAttr).length) {
    const daDiff = diffSet(darkAttr, BASELINE.dark)
    if (daDiff.length) {
      console.error('[data-theme="dark"] 令牌与基准不一致：')
      console.error(describe(daDiff))
      failed = true
    }
  }

  // 两个暗色来源彼此也必须一致（任一来源单独漂移即失败）
  if (Object.keys(darkMedia).length && Object.keys(darkAttr).length) {
    const crossDiff = TOKENS.filter((name) => darkMedia[name] !== darkAttr[name]).map((name) => ({
      name,
      expected: darkMedia[name] ?? '(缺失)',
      actual: darkAttr[name] ?? '(缺失)',
    }))
    if (crossDiff.length) {
      console.error('暗色两来源（@media 与 data-theme）不一致：')
      console.error(describe(crossDiff))
      failed = true
    }
  }

  if (failed) {
    console.error('\n设计令牌校验失败。')
    process.exit(1)
  }

  console.log(`设计令牌校验通过：${TOKENS.length} 个核心令牌 × 深浅两套，与基准一致。`)
}

main()
