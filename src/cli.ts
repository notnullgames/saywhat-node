import { projectToXml, projectToResx, projectToJson, projectToTres, getType, compile } from './index'

import { v4 as uuid } from 'uuid'
import yargs, { Argv } from 'yargs'
import { promises as fs } from 'fs'

// do the actual output, once you've got a parsed project
async function handleOutput(project, argv ) {
    // default to JSON
    if (!argv.xml && !argv.json && !argv.resex && !argv.tres) {
      argv.json = true
    }
    if (argv.json) {
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
    } else if (argv.resex) {
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
async function getScript(argv){
  let script
  if (argv.sequence_file == null) {
    const chunks = []
    for await (const chunk of process.stdin) chunks.push(chunk)
    script = Buffer.concat(chunks).toString('utf8')
  } else {
    const file = String(argv.sequence_file)
    await fs.access(file)
    script = (await fs.readFile(file)).toString()
  }
  return script
}

// adds options for output, based on argv
function addOutputOptions(y){
  y.option('json', {
    alias: 'j',
    type: 'boolean',
    description: 'Export JSON',
    conflicts: ['xml', 'resex', 'tres']
  })
  y.option('xml', {
    alias: 'x',
    type: 'boolean',
    description: 'Export XML',
    conflicts: ['json', 'resex', 'tres']
  })
  y.option('resex', {
    alias: 'r',
    type: 'boolean',
    description: 'Export ResX',
    conflicts: ['xml', 'json', 'tres']
  })
  y.option('tres', {
    alias: ['t', 'godot', 'g'],
    type: 'boolean',
    description: 'Export Godot resource',
    conflicts: ['xml', 'json', 'resex']
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
  },
  async (argv) => {
    if (!argv.project_file) {
      throw new Error('Must provide project-file')
    }
    const file = String(argv.project_file)
    await fs.access(file)
    const project = JSON.parse((await fs.readFile(file)).toString())
    await handleOutput(project, argv)
  })
  
  .command('compile [sequence_file]', 'Compile a sequence from file/stdin', (y) => {
    addOutputOptions(y)
    y.example('$0 compile dialog.seq', 'Compile dialog.seq')
    y.example('cat dialog.seq | $0 compile', 'Another way to compile dialog.seq')
  },
  async (argv) => {
    const project = {
        savedWithVersion: 1.7,
        sequences: [
          {
            id: uuid(),
            updatedAt: new Date(),
            name: 'Generated Sequence',
            nodes: [compile(await getScript(argv))]
          }
        ]
      }
    await handleOutput(project, argv)
  })

  .command('lint [sequence_file]', 'Check the syntax of sequence from file/stdin', (y) => {
    y.option('pretty', {
      type: 'boolean',
      alias: 'p',
      description: 'Pretty-print the dialog on success'
    })
    y.option('node', {
      alias: 'n',
      type: 'string',
      description: 'Check just a single node (by ID)'
    })
    y.example('$0 lint dialog.seq', 'Check the syntax of dialog.seq')
    y.example('cat dialog.seq | $0 lint', 'Another way to check the syntax of dialog.seq')
    y.example('$0 lint -p dialog.seq', 'Check the syntax of dialog.seq and output pretty colored representation of it')
    y.example('$0 lint -n edf56d32-7c17-467d-ba7a-6fe710bd74f4 dialog.seq', 'only check node edf56d32-7c17-467d-ba7a-6fe710bd74f4')
  },
  async (argv) => {
    const script = await getScript(argv)

  })

  .example('$0 compile --help', 'Get help with options for compiling')
  .example('$0 lint --help', 'Get help with options for syntax-checking')
  .argv
