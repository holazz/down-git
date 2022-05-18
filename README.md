# 🐙 Down Git

[![NPM version](https://img.shields.io/npm/v/down-git?color=b43b4f&label=)](https://www.npmjs.com/package/down-git)

Download directory or file from GitHub.

## Install

```bash
npm i down-git
# yarn add down-git
# pnpm add down-git
```

## Usage

The following command downloads the directory `https://github.com/holazz/down-git/tree/main/src` into the `./tmp` folder

``` bash
down-git holazz/down-git/src -b main -o ./tmp
```

> Use `down-git --help` for more information

You can also use it programmatically：

``` ts
import { download } from 'down-git'

const options = {
  route: 'holazz/down-git/src',
  branch: 'main',
  output: './tmp',
}

download(options).then(
  () => console.log('Done!')
)
```

### Options

| name | required | description | default |
| --- | --- | --- | --- |
| `route` | true | Directory or file path (owner/repo/path)| - |
| `branch` | false | The name of the commit/branch/tag | Repository's default branch (usually `main` or `master`) |
| `output` | false | Output directory| `process.cwd()` |
| `token` | false | Personal access token| - |

## License

[MIT](./LICENSE) License © 2022 [zz](https://github.com/holazz)
