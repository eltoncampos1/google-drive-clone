import {
  describe,
  test,
  expect,
  jest,
  beforeAll,
  afterAll,
} from '@jest/globals'
import { logger } from '../../src/logger.js'
import FormData from 'form-data'
import fs from 'fs'
import FileHelper from '../../src/fileHelper.js'

import TestUtil from '../_util/testUtil.js'
import Routes from '../../src/routes.js'
import { tmpdir } from 'os'
import { join } from 'path'

describe('Routes integration test', () => {
  let defaultDonwloadsFolder = ''
  const ioObj = {
    to: (id) => ioObj,
    emit: (event, message) => {},
  }

  beforeEach(() => {
    jest.spyOn(logger, 'info').mockImplementation()
  })

  beforeAll(async () => {
    defaultDonwloadsFolder = await fs.promises.mkdtemp(
      join(tmpdir(), 'downloads-')
    )
  })

  afterAll(async () => {
    await fs.promises.rm(defaultDonwloadsFolder, { recursive: true })
  })

  describe('getFileStatus', () => {
    test('should upload file to the folder', async () => {
      const filename = 'mac.jpeg'
      const fileStream = fs.createReadStream(
        `./test/integration/mocks/${filename}`
      )
      const response = TestUtil.generateWritebleStream(() => {})

      const form = new FormData()
      form.append('img', fileStream)

      const defaultParams = {
        request: Object.assign(form, {
          headers: form.getHeaders(),
          method: 'POST',
          url: '?socketId-10',
        }),
        response: Object.assign(response, {
          setHeader: jest.fn(),
          writeHead: jest.fn(),
          end: jest.fn(),
        }),
        values: () => Object.values(defaultParams),
      }

      //   const defaultDownloadsFolder = '/tmp'
      const routes = new Routes(defaultDonwloadsFolder)
      routes.setSocketInstance(ioObj)
      const dirBefore = await fs.promises.readdir(defaultDonwloadsFolder)
      expect(dirBefore).toEqual([])
      await routes.handler(...defaultParams.values())
      const dirAfter = await fs.promises.readdir(defaultDonwloadsFolder)
      expect(dirAfter).toEqual([filename])

      expect(defaultParams.response.writeHead).toHaveBeenCalledWith(200)
      const expectedResult = { result: 'Files uploaded with success!' }
      expect(defaultParams.response.end).toHaveBeenCalledWith(
        JSON.stringify(expectedResult)
      )
    })
  })
})
