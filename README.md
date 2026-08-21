# dsh-plugin-xquant

把 [xquant](https://xquant.shop) 的量化研究 MCP 接入 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)。安装一次，就能在 dsh Web 中查询因子、策略逻辑与历史数据。

> 研究工具，不提供具体买卖建议、个性化投资建议或市场预测。历史业绩不代表未来表现，投资有风险。

## 安装

### 1. 安装 dsh

```bash
npm install --global @deepseek-ai/dsh@0.1.0-rc.7
dsh --version
```

如果提示 `dsh: command not found`，执行下面两行后重开终端：

```bash
echo 'export PATH="$(npm prefix -g)/bin:$PATH"' >> ~/.zshrc
exec zsh
```

### 2. 安装 xquant 插件

先在 [xquant 开发者中心](https://xquant.shop/developer?utm=dsh) 创建 API Key，再执行：

```bash
export XQUANT_API_KEY='xq_live_...'
dsh plugin --profile web add dsh-plugin-xquant
```

启动 dsh Web：

```bash
dsh web
```

插件默认连接 `https://xquant.shop/xquant-mcp/mcp`。不要填写已迁移的 `/factor-mcp/` 路径。

## 可做什么

- 查询可用因子及其定义；
- 计算已支持标的和时间窗口的因子时序；
- 浏览策略逻辑、历史绩效与历史信号的权限内信息；
- 让“小量”风格的研究指引把工具结果解释成更易读的研究结论。

示例问题：

```text
动量因子通常怎样计算？先查 xquant 的因子定义，再用一个股票示例说明。
```

```text
帮我比较两个已公开策略的历史收益和回撤；不要给出买卖建议。
```

## 配置私有或 staging 环境

仅需覆盖服务 origin；插件会固定补全 `/xquant-mcp/mcp`，从而避免误连旧路径：

```bash
export XQUANT_MCP_ORIGIN='https://staging.xquant.shop'
export XQUANT_API_KEY='xq_live_...'
```

`XQUANT_MCP_ORIGIN` 必须是没有 path、query 或 hash 的 HTTP(S) origin，例如 `https://mcp.example.com`。它不是完整 MCP URL。

## 权限、计费与安全

- API Key 只从 dsh 进程环境读取；插件不写入配置文件、不上传、不打印该值。
- xquant 服务端是权限和合规的唯一边界。付费内容、近期调仓信号和管理员工具只会按当前账号权限返回；非管理员不会因安装插件而获得管理员工具。
- 插件不在本地计费。服务端只会按既有规则对成功的 `compute_factor` 调用记录用量；MCP 握手、工具枚举和失败调用不应扣除因子计算额度。
- 未设置 `XQUANT_API_KEY` 时，请访问 [开发者中心](https://xquant.shop/developer?utm=dsh) 获取 Key 后重启 dsh。

## 开发

```bash
pnpm install
pnpm test
pnpm run typecheck
pnpm run build
```

DeepSeek Harness 仍处于 developer preview。本包目前针对 `dsh@0.1.0-rc.7` 验证；升级 dsh 前请运行完整冒烟测试并阅读 release notes。

## License

[MIT](./LICENSE)
