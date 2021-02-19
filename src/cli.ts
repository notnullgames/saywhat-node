import { projectToXml, projectToResx, projectToJson, projectToTres, getType, compile, lint, prettyprint } from './index'

import { v4 as uuid } from 'uuid'
import yargs, { Argv } from 'yargs'
import { promises as fs } from 'fs'
import { basename } from 'path'
import chalk from 'chalk'
import supportsColor from 'supports-color'
import { inspect } from 'util'

interface Arguments {
  project: boolean
  json: boolean
  xml: boolean
  resx: boolean
  tres: boolean
  sequence_file: string[]
  project_file: string
  write: string
  pretty: boolean
}

// do the actual output, once you've got a parsed project
async function handleOutput (project, argv: Arguments) {
  if (argv.project) {
    if (argv.write) {
      await fs.writeFile(argv.write, JSON.stringify(project))
    } else {
      console.log(inspect(project, false, null, true))
    }
  } else if (argv.json) {
    if (argv.write) {
      await fs.writeFile(argv.write, projectToJson(project))
    } else {
      console.log(projectToJson(project, 2))
    }
  } else if (argv.xml) {
    const out = projectToXml(project)
    if (argv.write) {
      await fs.writeFile(argv.write, out)
    } else {
      console.log(out)
    }
  } else if (argv.resx) {
    const out = projectToResx(project)
    if (argv.write) {
      await fs.writeFile(argv.write, out)
    } else {
      console.log(out)
    }
  } else if (argv.tres) {
    const out = projectToTres(project)
    if (argv.write) {
      await fs.writeFile(argv.write, out)
    } else {
      console.log(out)
    }
  }
}

// get input script from stdin/file (based on argv)
async function getScripts (argv: Arguments) {
  const script: string[] = []
  if (argv.sequence_file == null || argv.sequence_file.length == 0) {
    const chunks = []
    for await (const chunk of process.stdin) chunks.push(chunk)
    script.push(Buffer.concat(chunks).toString('utf8'))
  } else {
    for (const f of argv.sequence_file) {
      const file = String(f)
      await fs.access(file)
      script.push((await fs.readFile(file)).toString())
    }
  }
  return script
}

// adds options for output, based on argv
function addOutputOptions (y) {
  y.option('json', {
    alias: 'j',
    type: 'boolean',
    description: 'Export JSON',
    conflicts: ['xml', 'resx', 'tres']
  })
  y.option('xml', {
    alias: 'x',
    type: 'boolean',
    description: 'Export XML',
    conflicts: ['json', 'resx', 'tres']
  })
  y.option('resx', {
    alias: 'r',
    type: 'boolean',
    description: 'Export ResX',
    conflicts: ['xml', 'json', 'tres']
  })
  y.option('tres', {
    alias: ['t', 'godot', 'g'],
    type: 'boolean',
    description: 'Export Godot resource',
    conflicts: ['xml', 'json', 'resx']
  })
  y.option('write', {
    alias: 'w',
    type: 'string',
    description: 'Save the output to a file'
  })
  return y
}

const argv = yargs
  .command('$0 <project_file>', 'Process a SayWhat project-file', (y) => {
    addOutputOptions(y)
    y.example('$0 dialog.saywhat', 'Output JSON to console')
    y.example('$0 dialog.saywhat -g -w dialog.tres', 'Output Godot file')
    y.example('$0 dialog.saywhat -x -w dialog.xml', 'Output XML file')
  },
  async (argv: Arguments) => {
    if (!argv.project_file) {
      throw new Error('Must provide project-file')
    }
    // default to JSON
    if (!argv.xml && !argv.resx && !argv.tres) {
      argv.json = true
    }
    const file = String(argv.project_file)
    await fs.access(file)
    const project = JSON.parse((await fs.readFile(file)).toString())
    await handleOutput(project, argv)
  })

  .command('compile [sequence_file...]', 'Compile a sequence from file/stdin', (y) => {
    addOutputOptions(y)
    y.option('project', {
      alias: 'p',
      type: 'boolean',
      description: 'Output SayWhat Project',
      conflicts: ['xml', 'resx', 'tres', 'json']
    })
    y.example('$0 compile dialog.seq', 'Compile dialog.seq')
    y.example('cat dialog.seq | $0 compile', 'Another way to compile dialog.seq')
  },
  async (argv: Arguments) => {
    // default to project
    if (!argv.xml && !argv.json && !argv.resx && !argv.tres) {
      argv.project = true
    }
    const names = argv.sequence_file.length > 0 ? argv.sequence_file.map(n => basename(n).replace(/\.[^/.]+$/, '')) : ['Generated Node']
    const scripts = await getScripts(argv)
    const nodes = scripts.map((script, i) => {
      const name = names[i] || 'generated'
      return compile(script, name)
    })
    const project = {
      savedWithVersion: 1.7,
      sequences: [
        {
          id: uuid(),
          updatedAt: new Date(),
          name: 'Generated Sequence',
          nodes
        }
      ]
    }
    await handleOutput(project, argv)
  })

  .command('lint [sequence_file...]', 'Check the syntax of sequence from file/stdin', (y) => {
    y.option('pretty', {
      type: 'boolean',
      alias: 'p',
      description: 'Pretty-print the dialog on success'
    })
    y.example('$0 lint dialog.seq', 'Check the syntax of dialog.seq')
    y.example('cat dialog.seq | $0 lint', 'Another way to check the syntax of dialog.seq')
    y.example('$0 lint -p dialog.seq', 'Check the syntax of dialog.seq and output pretty colored representation of it')
    y.example('$0 lint -n edf56d32-7c17-467d-ba7a-6fe710bd74f4 dialog.seq', 'only check node edf56d32-7c17-467d-ba7a-6fe710bd74f4')
  },
  async (argv: Arguments) => {
    const scripts = await getScripts(argv)
    const names = argv.sequence_file.length > 0 ? argv.sequence_file.map(n => basename(n).replace(/\.[^/.]+$/, '')) : ['STDIN'] 

    scripts.forEach((script, i) => {
      const errors = lint(script)
      if (errors.length == 0) {
        if (argv.pretty) {
          console.log("\n" + chalk.underline.bold.white(names[i]))
          prettyprint(script)
        }
      } else {
        // display messages like eslint does
        if (supportsColor.stdout) {
          console.log(chalk.white.underline(names[i]))
          for (const { line, character, message } of errors) {
            console.log(`\t${chalk.grey(`${line}:${character}`)}\t${chalk.red('error')}\t${chalk.white(message)}`)
          }
        } else {
          console.log(names[i])
          for (const { line, character, message } of errors) {
            console.log(`\t${line}:${character}\terror\t${message}`)
          }
        }
      }
    })
  })

  .example('$0 compile --help', 'Get help with options for compiling')
  .example('$0 lint --help', 'Get help with options for syntax-checking')
  .argv
