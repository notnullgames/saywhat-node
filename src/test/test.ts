import baretest from 'baretest'
import assert from 'assert'

import { projectToXml, projectToResx, projectToJson, projectToTres, getType, keyBy } from '../index'

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
  assert.ok(getType)
  assert.ok(keyBy)
})

test.run()
