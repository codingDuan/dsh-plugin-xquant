import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-system-prompt'

const DEFAULT_ORIGIN = 'https://xquant.shop'
const MCP_PATH = '/xquant-mcp/mcp'

export const RESEARCH_GUIDANCE = `
## xquant 量化研究边界

你可以用 xquant 工具查询因子定义、因子时序、策略逻辑和历史数据。涉及具体数据时，必须调用 xquant 工具，不要凭记忆编造结果。

只提供研究和教育用途的解释，不提供具体买卖建议、个性化投资建议或市场/个股涨跌预测。若回复包含历史业绩数字，必须明确说明：历史业绩不代表未来表现，投资有风险，本内容不构成投资建议。

近期调仓信号、付费内容和管理员能力由 xquant 服务端的订阅与权限规则决定；不要尝试猜测、绕过或承诺这些内容。若用户未配置 XQUANT_API_KEY，请引导其访问 https://xquant.shop/developer?utm=dsh 创建 API Key。
`.trim()

export function xquantMcpUrl(origin = process.env.XQUANT_MCP_ORIGIN): string {
  const candidate = origin ?? DEFAULT_ORIGIN
  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    throw new Error('XQUANT_MCP_ORIGIN must be an absolute HTTP(S) origin without a path')
  }
  if ((parsed.protocol !== 'https:' && parsed.protocol !== 'http:')
    || parsed.pathname !== '/'
    || parsed.search !== ''
    || parsed.hash !== '') {
    throw new Error('XQUANT_MCP_ORIGIN must be an absolute HTTP(S) origin without a path')
  }
  return `${parsed.origin}${MCP_PATH}`
}

export const name = 'xquant'

// Cordis only exposes services that a plugin declares up front. Keep this
// explicit so the prompt section works when loaded from a dsh profile bundle.
export const inject = ['systemPrompt']

export async function apply(ctx: Context): Promise<void> {
  ctx.effect(() => ctx.systemPrompt.section({
    name: 'xquant:research-guidance',
    order: 120,
    text: RESEARCH_GUIDANCE,
  }))
}
