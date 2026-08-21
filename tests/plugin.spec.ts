import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

import { apply, inject, RESEARCH_GUIDANCE, xquantMcpUrl } from '../src/index.js'

describe('xquant MCP endpoint', () => {
  it('uses the official endpoint when no override is supplied', () => {
    expect(xquantMcpUrl()).toBe('https://xquant.shop/xquant-mcp/mcp')
  })

  it('accepts an HTTPS origin and always appends the xquant MCP path', () => {
    expect(xquantMcpUrl('https://staging.xquant.shop/')).toBe('https://staging.xquant.shop/xquant-mcp/mcp')
  })

  it.each([
    'https://xquant.shop/factor-mcp',
    'https://xquant.shop/xquant-mcp/mcp',
    'https://xquant.shop?preview=true',
    'ftp://xquant.shop',
  ])('rejects an endpoint rather than an origin: %s', origin => {
    expect(() => xquantMcpUrl(origin)).toThrow(/origin/i)
  })
})

describe('Cordis plugin', () => {
  it('declares the system prompt service required by apply', () => {
    expect(inject).toEqual(['systemPrompt'])
  })

  it('registers the research prompt without mounting a second MCP client', async () => {
    const ctx = {
      effect: vi.fn((effect: () => unknown) => effect()),
      systemPrompt: { section: vi.fn(() => vi.fn()) },
    }

    await apply(ctx as never)

    expect(ctx.systemPrompt.section).toHaveBeenCalledWith({
      name: 'xquant:research-guidance',
      order: 120,
      text: RESEARCH_GUIDANCE,
    })
  })

  it('contains the research, permission, and investment-advice boundaries', () => {
    expect(RESEARCH_GUIDANCE).toContain('因子')
    expect(RESEARCH_GUIDANCE).toContain('历史数据')
    expect(RESEARCH_GUIDANCE).toContain('不构成投资建议')
    expect(RESEARCH_GUIDANCE).toContain('服务端')
    expect(RESEARCH_GUIDANCE).not.toContain('当前持仓')
  })
})

describe('bundle patch', () => {
  it('uses dsh built-ins to mount one authenticated xquant MCP client', () => {
    const patch = readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8')

    expect(patch).toContain("id: mcp-xquant")
    expect(patch).toContain("name: '@deepseek-ai/dsh-mcp-client'")
    expect(patch).toContain('transport: streamable-http')
    expect(patch).toContain('serverName: xquant')
    expect(patch).toContain('XQUANT_MCP_ORIGIN')
    expect(patch).toContain('XQUANT_API_KEY')
  })
})
