import { describe, test, expect, jest } from '@jest/globals'
import fs from 'fs'
import Routes from '../../src/routes.js'
import FileHelper from '../../src/fileHelper.js'

describe('FileHelper', () => {
  describe('getFileStatus', () => {
    test('it should return file statuses in correct format', async () => {
      const statMock = {
        dev: 2066,
        mode: 33188,
        nlink: 1,
        uid: 1000,
        gid: 1000,
        rdev: 0,
        blksize: 4096,
        ino: 410927,
        size: 88120,
        blocks: 176,
        atimeMs: 1687968575434.6638,
        mtimeMs: 1687968575250.6638,
        ctimeMs: 1687968575250.6638,
        birthtimeMs: 1687968575250.6638,
        atime: '2023-06-28T16:09:35.435Z',
        mtime: '2023-06-28T16:09:35.251Z',
        ctime: '2023-06-28T16:09:35.251Z',
        birthtime: '2023-06-28T16:09:35.251Z',
      }

      const mockUser = 'eltoncampos1'
      process.env.USER = mockUser
      const filename = 'file.png'

      jest
        .spyOn(fs.promises, fs.promises.readdir.name)
        .mockResolvedValue([filename])
      jest.spyOn(fs.promises, fs.promises.stat.name).mockResolvedValue(statMock)

      const result = await FileHelper.getFilesStatus('/tmp')
      const expectedResult = [
        {
          size: '88.1 kB',
          lastModified: statMock.birthtime,
          owner: mockUser,
          file: 'file.png',
        },
      ]

      expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${filename}`)
      expect(result).toMatchObject(expectedResult)
    })
  })
})
