import baretest from 'baretest'
import assert from 'assert'

import { projectToXml, projectToResx, projectToJson, projectToTres } from '../index'
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

test.run()
