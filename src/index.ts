import { createWriteStream, existsSync, promises as fs } from 'node:fs'
import { Readable, promises as stream } from 'node:stream'
import { Buffer } from 'node:buffer'
import { dirname, resolve } from 'node:path'
import { Octokit } from '@octokit/rest'
import ora from 'ora'

export interface Config {
  route: string
  branch?: string
  output?: string
  token?: string
}

interface Route {
  owner: string
  repo: string
  path?: string
}

interface Context extends Pick<Config, 'branch'>, Route {
  octokit: Octokit
}

function resolveRoute(route: string): Route {
  const [owner, repo, path] = route.split(/(?<=^[^\/]+(?:\/[^\/]+)?)\//)
  return { owner, repo, path }
}

function getOctokit(token?: string): Octokit {
  const octokit = new Octokit({
    auth: token,
  })
  return octokit
}

async function getDefaultBranch(ctx: Context): Promise<string> {
  const { octokit, owner, repo } = ctx
  const { data } = await octokit.rest.repos.get({ owner, repo })
  return data.default_branch
}

async function fetchFiles(ctx: Context) {
  const branch = ctx.branch || await getDefaultBranch(ctx)
  const { data } = await ctx.octokit.rest.git.getTree({
    owner: ctx.owner,
    repo: ctx.repo,
    tree_sha: branch,
    recursive: '1',
  })
  const requests = data.tree
    .filter(node => node.path?.startsWith(ctx.path || '') && node.type === 'blob')
    .map(async (node) => {
      const { data: blob } = await ctx.octokit.git.getBlob({
        owner: ctx.owner,
        repo: ctx.repo,
        file_sha: node.sha!,
      })
      return {
        path: node.path,
        content: Buffer.from(blob.content as WithImplicitCoercion<string>, blob.encoding as BufferEncoding),
        url: blob.url,
      }
    })
  return await Promise.all(requests)
}

export async function download(config: Config): Promise<void> {
  const start = Date.now()
  const spinner = ora('Downloading...').start()
  try {
    const { route, branch, output, token } = config
    const octokit = getOctokit(token)
    const context: Context = {
      octokit,
      branch,
      ...resolveRoute(route),
    }
    const files = await fetchFiles(context)

    const requests = files.map(async (file) => {
      const dest = resolve(output || process.cwd(), file.path!)
      if (!existsSync(dirname(dest)))
        await fs.mkdir(dirname(dest), { recursive: true })
      const writer = createWriteStream(dest)
      await stream.pipeline(Readable.from(file.content), writer)
      return file
    })
    await Promise.all(requests)
    spinner.succeed(
    `Done in ${((Date.now() - start) / 1000).toFixed(2)}s!`
    )
  } catch (e: any) {
    spinner.fail(e.message)
  }
}
