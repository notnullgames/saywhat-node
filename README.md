# saywhat-parse

Library for parsing [SayWhat](https://github.com/nathanhoad/SayWhat) text, and turning it into other formats.

## installation

- You can install the CLI `saywhat` in your path with `npm i -g saywhat-parse`.
- You can run it without installing it with `npx saywhat-parse`
- You can install it in your project with `npm i saywhat-parse`

## CLI

```
saywhat <project_file>

Process a SayWhat project-file

Options:
    --help               Show help                                   [boolean]
    --version            Show version number                         [boolean]
  -j, --json               Export JSON                                 [boolean]
  -x, --xml                Export XML                                  [boolean]
  -r, --resex              Export ResX                                 [boolean]
  -t, -g, --tres, --godot  Export Godot resource                       [boolean]
  -w, --write              Save the output to a file                    [string]
```

## Code

### Typescript / ES6

```js
import { projectToXml, projectToResx, projectToJson, projectToTres } from 'saywhat-parse'
import { promises as fs } from 'fs'

async function main () {
  // load your project-file as an object
  const project = JSON.parse((await fs.readFile(`${__dirname}/test.saywhat`)).toString())
  
  console.log(projectToXml(project))
  console.log(projectToResx(project))
  console.log(projectToJson(project))
  console.log(projectToTres(project))
}
main()
```

### ES5 / CommonJS

```js
const { projectToXml, projectToResx, projectToJson, projectToTres } = require('saywhat-parse')
const fs = require('fs').promises

async function main () {
  // load your project-file as an object
  const project = JSON.parse((await fs.readFile(`${__dirname}/test.saywhat`)).toString())
  
  console.log(projectToXml(project))
  console.log(projectToResx(project))
  console.log(projectToJson(project))
  console.log(projectToTres(project))
}
main()
```

## TODO

- Provide function to turn raw dialogue into project
- Provide linting function to check a raw dialogue