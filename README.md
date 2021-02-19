# saywhat-parse

Library for parsing [SayWhat](https://github.com/nathanhoad/SayWhat) text and project-files, and turning it into other formats.

## installation

- You can install the CLI `saywhat` in your path with `npm i -g saywhat-parse`.
- You can run it without installing it with `npx saywhat-parse`
- You can install it in your project with `npm i saywhat-parse`

## CLI

```
saywhat <project_file>

Process a SayWhat project-file

Commands:
  cli.ts compile [project_file]  Compile a sequence for a dialog script
  cli.ts <project_file>          Process a SayWhat project-file        [default]

Options:
      --help               Show help                                   [boolean]
      --version            Show version number                         [boolean]
  -j, --json               Export JSON                                 [boolean]
  -x, --xml                Export XML                                  [boolean]
  -r, --resex              Export ResX                                 [boolean]
  -t, -g, --tres, --godot  Export Godot resource                       [boolean]
  -w, --write              Save the output to a file                    [string]

```

`compile` can also compile stdin, if no `project_file` is provided, for example:

```sh
cat src/test/test.dialog | saywhat compile
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

You can also compile raw dialog-script into a project:

```js
import { compile, projectToJson } from 'saywhat-parse'
import { v4 as uuid } from 'uuid'

const script = `
Character: Hello!
[if has_met_character] Character: It's nice to meet you.
# This is a comment
[do has_met_character = true]

Can you repeat that? -> Start
That's all for now -> END
`

const project = {
  savedWithVersion: 1.7,
  sequences: [
    {
      id: uuid(),
      updatedAt: new Date(),
      name: 'Example Sequence',
      nodes: [compile(script)]
    }
    // you can add more sequences here
  ]
}

console.log(projectToJson(project, 2))
```

## TODO

- Provide linting function to check a raw dialogue