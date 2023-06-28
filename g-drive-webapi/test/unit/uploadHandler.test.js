import fs from 'fs'
import { resolve } from 'path'
import { pipeline } from 'stream/promises'

import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import UploadHandler from '../../src/uploadHandler.js'
import TestUtil from '../_util/testUtil.js'

import { logger } from '../../src/logger.js'

describe('UploadHandler', () => {
  const ioObj = {
    to: (id) => ioObj,
    emit: (event, message) => {},
  }

  beforeEach(() => {
    jest.spyOn(logger, 'info').mockImplementation()
  })
  describe('registerEvents', () => {
    test('should call onFile and onFinish funs on Busboy instance', async () => {
      const uploadHandler = new UploadHandler({ io: ioObj, socketId: '1' })

      jest.spyOn(uploadHandler, uploadHandler.onFile.name).mockResolvedValue()

      const headers = {
        'content-type': 'multipart/form-data; boundary=',
      }
      const onFinish = jest.fn()
      const busboyInstance = uploadHandler.registerEvents(headers, onFinish)
      const fileStream = TestUtil.generateReadableStream([
        'chunk',
        'of',
        'data',
      ])
      busboyInstance.listeners('finish')[0].call()
      busboyInstance.emit('file', 'fieldname', fileStream, 'filename.txt')
      expect(uploadHandler.onFile).toHaveBeenCalled()
      expect(onFinish).toHaveBeenCalled()
    })
  })

  describe('onFile', () => {
    test('given a stream file it should save it on disk', async () => {
      const chunks = ['chunk1', 'chunk2', 'chunk3']
      const downloadsfolder = '/tmp'

      const handler = new UploadHandler({
        io: ioObj,
        socketId: '1',
        downloadsfolder,
      })

      const onData = jest.fn()

      jest
        .spyOn(fs, fs.createWriteStream.name)
        .mockImplementation(() => TestUtil.generateWritebleStream(onData))

      const onTransform = jest.fn()

      jest
        .spyOn(handler, handler.handleFileBytes.name)
        .mockImplementation(() => TestUtil.generateTransformStream(onTransform))

      const params = {
        fieldname: 'video',
        file: TestUtil.generateReadableStream(chunks),
        filename: 'mock-file.mov',
      }

      await handler.onFile(...Object.values(params))

      expect(onData.mock.calls.join()).toEqual(chunks.join())
      expect(onTransform.mock.calls.join()).toEqual(chunks.join())
      const expectedFilename = resolve(handler.downloadsfolder, params.filename)
      expect(fs.createWriteStream).toHaveBeenCalledWith(expectedFilename)
    })
  })

  describe('handleFileBytes', () => {
    test('should call emit function and it is a transform stream', async () => {
      jest.spyOn(ioObj, ioObj.to.name)
      jest.spyOn(ioObj, ioObj.emit.name)

      const handler = new UploadHandler({
        io: ioObj,
        socketId: '1',
      })

      jest.spyOn(handler, handler.canExecute.name).mockReturnValue(true)

      const messages = ['msg-01']
      const source = TestUtil.generateReadableStream(messages)
      const onWrite = jest.fn()
      const target = TestUtil.generateWritebleStream(onWrite)

      await pipeline(source, handler.handleFileBytes('filename.txt'), target)

      expect(ioObj.to).toHaveBeenCalledTimes(messages.length)
      expect(ioObj.emit).toHaveBeenCalledTimes(messages.length)

      expect(onWrite).toHaveBeenCalledTimes(messages.length)
      expect(onWrite.mock.calls.join()).toEqual(messages.join())
    })

    test('given message timerDelay as 2secs it should emit only on message during 2 seconds period', async () => {
      jest.spyOn(ioObj, ioObj.emit.name)
      const messageTimeDelay = 2000

      const handler = new UploadHandler({
        io: ioObj,
        socketId: '1',
        messageTimeDelay,
      })

      const messages = ['hello', 'world', '!!!']
      const filename = 'filename.png'
      const expectedMessagesSent = 2

      const day = '2023-06-28 01:01'
      const onIniVariable = TestUtil.getTimeFromDate(`${day}:00`)
      const onFirstCanExecute = TestUtil.getTimeFromDate(`${day}:02`)
      const onFirstUpdatelastMessage = onFirstCanExecute
      const onSecondcanExecute = TestUtil.getTimeFromDate(`${day}:03`)
      const onThirdcanExecute = TestUtil.getTimeFromDate(`${day}:04`)

      TestUtil.mockDateNow([
        onIniVariable,
        onFirstCanExecute,
        onFirstUpdatelastMessage,
        onSecondcanExecute,
        onThirdcanExecute,
      ])

      const source = TestUtil.generateReadableStream(messages)

      await pipeline(source, handler.handleFileBytes(filename))

      expect(ioObj.emit).toHaveBeenCalledTimes(expectedMessagesSent)

      const [firstCallResult, secondCallResult] = ioObj.emit.mock.calls
      expect(firstCallResult).toEqual([
        handler.ON_UPLOAD_EVENT,
        { processedAlready: 'hello'.length, filename },
      ])
      expect(secondCallResult).toEqual([
        handler.ON_UPLOAD_EVENT,
        { processedAlready: messages.join('').length, filename },
      ])
    })
  })

  describe('canExecute', () => {
    test('should return true when time is later than specified delay', async () => {
      const timerDelay = 1000
      const handler = new UploadHandler({
        io: {},
        socketId: '',
        messageTimeDelay: timerDelay,
      })

      const tickNow = TestUtil.getTimeFromDate('2023-06-28 00:00:03')
      TestUtil.mockDateNow([tickNow])

      const tickThreeSecondsBefore = TestUtil.getTimeFromDate(
        '2023-06-28 00:00:00'
      )

      const lastExecution = tickThreeSecondsBefore

      const result = handler.canExecute(lastExecution)

      expect(result).toBeTruthy()
    })

    test('should return false when time isnt later than specified delay', async () => {
      const timerDelay = 3000
      const handler = new UploadHandler({
        io: {},
        socketId: '',
        messageTimeDelay: timerDelay,
      })

      const tickNow = TestUtil.getTimeFromDate('2023-06-28 00:00:02')
      TestUtil.mockDateNow([tickNow])

      const lastExecution = TestUtil.getTimeFromDate('2023-06-28 00:00:01')

      const result = handler.canExecute(lastExecution)

      expect(result).toBeFalsy()
    })
  })
})
