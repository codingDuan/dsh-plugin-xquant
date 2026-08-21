import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const workspace = mkdtempSync(join(tmpdir(), 'dsh-plugin-xquant-'))
const packageVersion = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version

execFileSync('pnpm', ['pack', '--pack-destination', workspace], { stdio: 'inherit' })
const tarball = join(workspace, `dsh-plugin-xquant-${packageVersion}.tgz`)
const environment = { ...process.env, DSH_HOME: join(workspace, 'home') }
execFileSync('pnpm', ['dlx', '@deepseek-ai/dsh@0.1.0-rc.7', 'plugin', '--profile', 'web', 'add', tarball], {
  stdio: 'inherit',
  env: environment,
})

const manifest = JSON.parse(readFileSync(join(environment.DSH_HOME, 'profiles', 'web', 'package.json'), 'utf8'))
if (manifest.dependencies?.['dsh-plugin-xquant'] === undefined
  || !manifest.dsh?.profile?.bundles?.includes('dsh-plugin-xquant')) {
  throw new Error('dsh did not register dsh-plugin-xquant as a web-profile bundle')
}

const boot = spawnSync('pnpm', ['dlx', '@deepseek-ai/dsh@0.1.0-rc.7', '--profile', 'web', '--no-open', '--port', '0'], {
  encoding: 'utf8',
  env: environment,
  timeout: 8_000,
})
const bootOutput = `${boot.stdout}${boot.stderr}`
if (!bootOutput.includes('dsh web: http://')) {
  throw new Error(`dsh web failed to start after plugin installation:\n${bootOutput}`)
}

console.log('dsh plugin install and boot smoke passed')
