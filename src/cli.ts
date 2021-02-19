import { projectToXml, projectToResx, projectToJson, projectToTres, getType, compile } from './index'

import { v4 as uuid } from 'uuid'
import yargs, { Argv } from 'yargs'
import { promises as fs } from 'fs'

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

const argv = yargs
  .option('json', {
    alias: 'j',
    type: 'boolean',
    description: 'Export JSON',
    conflicts: ['xml', 'resex', 'tres']
  })
  .option('xml', {
    alias: 'x',
    type: 'boolean',
    description: 'Export XML',
    conflicts: ['json', 'resex', 'tres']
  })
  .option('resex', {
    alias: 'r',
    type: 'boolean',
    description: 'Export ResX',
    conflicts: ['xml', 'json', 'tres']
  })
  .option('tres', {
    alias: ['t', 'godot', 'g'],
    type: 'boolean',
    description: 'Export Godot resource',
    conflicts: ['xml', 'json', 'resex']
  })
  .option('write', {
    alias: 'w',
    type: 'string',
    description: 'Save the output to a file'
  })
  
  .command('compile [project_file]', 'Compile a sequence for a dialog script', () => {}, async (argv) => {
    let script
    if (argv.project_file == null) {
      const chunks = []
      for await (const chunk of process.stdin) chunks.push(chunk)
      script = Buffer.concat(chunks).toString('utf8')
    } else {
      const file = String(argv.project_file)
      await fs.access(file)
      script = (await fs.readFile(file)).toString()
    }
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
    await handleOutput(project, argv)
  })

  .command('$0 <project_file>', 'Process a SayWhat project-file', () => {}, async (argv) => {
    if (!argv.project_file) {
      throw new Error('Must provide project-file')
    }
    const file = String(argv.project_file)
    await fs.access(file)
    const project = JSON.parse((await fs.readFile(file)).toString())

    await handleOutput(project, argv)
  })
  .argv
