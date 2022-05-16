import mri from 'mri'
import colors from 'picocolors'
import { download } from './index'

const argv = mri(process.argv.slice(2), {
  alias: {
    b: 'branch',
    o: 'output',
    t: 'token',
    h: 'help',
  },
  string: ['branch', 'output', 'token'],
  boolean: ['help'],
})

if (argv.help) {
  help()
  process.exit(0)
}

if (!argv._.length) {
  console.error(colors.red('No route specified.'))
  help()
  process.exit(1)
}

const { _: [route], ...options } = argv
download({ route, ...options })

function help() {
  console.log(`
Usage:
  $ down-git ${colors.cyan('route')} [--branch=${colors.cyan('ref')}]  [--output=${colors.cyan('dir')}]  [--token=${colors.cyan('token')}]
Example:
  $ down-git holazz/down-git/src -b main -o ./tmp

Options:
  -r, --branch <ref>     ${colors.dim('[string]')} The name of the commit/branch/tag (default: repository's default branch)
  -o, --output <dir>     ${colors.dim('[string]')} Output directory (default: \`process.cwd()\`)
  -t, --token <token>    ${colors.dim('[string]')} Personal access token
`)
}
