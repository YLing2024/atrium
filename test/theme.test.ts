import test from 'node:test'
import assert from 'node:assert/strict'
import { getTheme, nextTheme } from '../src/theme.ts'

test('nextTheme：auto → light → dark → auto 循环', () => {
  assert.equal(nextTheme('auto'), 'light')
  assert.equal(nextTheme('light'), 'dark')
  assert.equal(nextTheme('dark'), 'auto')
  // 连续三次回到原点
  assert.equal(nextTheme(nextTheme(nextTheme('auto'))), 'auto')
})

test('getTheme：无浏览器存储时回退 auto', () => {
  // node 测试环境没有 window，getTheme 必须安全回退而非抛错
  assert.equal(getTheme(), 'auto')
})
