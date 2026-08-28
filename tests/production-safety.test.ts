import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
async function files(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true })
  return (
    await Promise.all(
      entries
        .filter((entry) => !['node_modules', '.git', 'dist'].includes(entry.name))
        .map((entry) =>
          entry.isDirectory() ? files(join(root, entry.name)) : [join(root, entry.name)],
        ),
    )
  ).flat()
}
describe('production safety guardrails', () => {
  it('contains no administrator credentials or prohibited generation attribution', async () => {
    const paths = await files('.')
    const text = (
      await Promise.all(
        paths
          .filter(
            (path) =>
              !path.includes('.test.') &&
              !path.endsWith('package-lock.json') &&
              !path.endsWith('.md'),
          )
          .map((path) => readFile(path, 'utf8').catch(() => '')),
      )
    ).join('\n')
    expect(text).not.toMatch(/service.?account|private_key|client_secret/i)
    expect(text).not.toMatch(
      new RegExp(
        [
          'ai' + ' studio',
          'google' + ' studio',
          'made with ' + 'ai',
          'ai-' + 'generated',
          'gem' + 'ini',
          'co' + 'dex',
          'open' + 'ai',
        ].join('|'),
        'i',
      ),
    )
  })
})
