import { projectToXml, projectToResx, projectToJson, projectToTres, getType, keyBy } from './index'

import yargs, { Argv } from 'yargs'
import { promises as fs } from 'fs'

let argv = yargs
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
  .command('$0 <project_file>', 'Process a SayWhat project-file', () => {}, async (argv) => {
    if (!argv.project_file) {
      throw new Error('Must provide project-file')
    }
    const file = String(argv.project_file)
    await fs.access(file)
    const project = JSON.parse((await fs.readFile(file)).toString())
    
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
  })
  .argv
