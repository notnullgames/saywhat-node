import baretest from 'baretest'
import assert from 'assert'

import { projectToXml, projectToResx, projectToJson, projectToTres, compile } from '../index'
import { promises as fs } from 'fs'

declare interface Baretest {
  (t: string, f: Function): void
  run: () => () => Promise<boolean>
  skip: () => (f: Function) => void
  before: () => (f: Function) => void
  after: () => (f: Function) => void
  only: () => (name: string, f: Function) => void
}

const test: Baretest = baretest('SayWhat')

const testCode = `
Character: Hello!
[if has_met_character] Character: It's nice to meet you.
# This is a comment
[do has_met_character = true]

Can you repeat that? -> Start
That's all for now -> END
`

test('Should have unit tests', () => {
  assert.ok(projectToXml)
  assert.ok(projectToResx)
  assert.ok(projectToJson)
  assert.ok(projectToTres)
})

test('projectToXml', async () => {
  const project = JSON.parse((await fs.readFile(`${__dirname}/test.saywhat`)).toString())
  const underTest = projectToXml(project)
  assert.ok(underTest)
})

test('projectToResx', async () => {
  const project = JSON.parse((await fs.readFile(`${__dirname}/test.saywhat`)).toString())
  const underTest = projectToResx(project)
  assert.ok(underTest)
})

test('projectToJson', async () => {
  const project = JSON.parse((await fs.readFile(`${__dirname}/test.saywhat`)).toString())
  const underTest = projectToJson(project)
  assert.ok(underTest)
})

test('projectToTres', async () => {
  const project = JSON.parse((await fs.readFile(`${__dirname}/test.saywhat`)).toString())
  const underTest = projectToTres(project)
  assert.ok(underTest)
})

test('compile', () => {
  const project = {
    savedWithVersion: 1.7,
    sequences: [
      {
        id: "204fea5f-6ebf-4252-b0ef-6052e50781c4",
        updatedAt: new Date(),
        name: "Example Sequence",
        nodes: [compile(testCode)]
      }
    ]
  }
  const underTest = projectToJson(project, 2)
  assert.ok(underTest)
})

test.run()
