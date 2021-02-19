# saywhat-parse

Library/CLI-tool for parsing [SayWhat](https://github.com/nathanhoad/SayWhat) text and project-files, and turning it into other formats.

## installation

- You can install the CLI `saywhat` in your path with `npm i -g saywhat-parse`.
- You can run it without installing it with `npx saywhat-parse`
- You can install it in your project with `npm i saywhat-parse`

## CLI

Run help to get help:

```sh
saywhat --help
```

There are a lot of options.

`compile`/`lint` can also compile stdin, if no `sequence_file` is provided, for example, this will print a colorized version of your file:

```sh
cat src/test/test.seq | saywhat lint -p
```

They also support multiple files:

```sh
cli.ts compile dialogs/*.txt -g -w dialogs.tres
cli.ts lint --pretty dialogs/*.txt
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
[if !has_met_character] Character: It's nice to meet you.
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
      nodes: [
        // add more here, if you have multiple scripts
        compile(script, "My Node")
      ]
    }
  ]
}

console.log(projectToJson(project, 2))
```

## TODO

- Provide linting function to check a raw dialogue with option for display