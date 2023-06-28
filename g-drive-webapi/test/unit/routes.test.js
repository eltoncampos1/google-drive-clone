import { describe, test, expect, jest } from '@jest/globals'
import Routes from '../../src/routes.js'

describe('Routes test suite', () => {
  const defaultParams = {
    request: {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      method: '',
      body: {},
    },
    response: {
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn(),
    },
    values: () => Object.values(defaultParams),
  }

  describe('setSocketInstance', () => {
    test('setSocket should store io instance', () => {
      const routes = new Routes()
      const ioObj = {
        to: (id) => ioObj,
        emit: (event, message) => {},
      }

      routes.setSocketInstance(ioObj)
      expect(routes.io).toStrictEqual(ioObj)
    })
  })

  describe('handler', () => {
    test('guiven an inexistent route should choose default route', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams,
      }
      params.request.method = 'invalid'
      await routes.handler(...params.values())
      expect(params.response.end).toHaveBeenCalledWith('Hello World')
    })

    test('it should set any request with CORS enabled', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams,
      }
      params.request.method = 'OPTIONS'
      await routes.handler(...params.values())
      expect(params.response.setHeader).toHaveBeenCalledWith(
        'Access-Control-allow-Origin',
        '*'
      )
    })

    test('guiven method OPTIONS it should choose options route', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams,
      }
      params.request.method = 'OPTIONS'
      await routes.handler(...params.values())
      expect(params.response.writeHead).toHaveBeenCalledWith(204)
      expect(params.response.end).toHaveBeenCalled()
    })

    test('guiven method POST it should choose post route', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams,
      }
      params.request.method = 'POST'
      jest.spyOn(routes, routes.post.name).mockResolvedValue()
      await routes.handler(...params.values())
      expect(routes.post).toHaveBeenCalled()
    })

    test('guiven method GET it should choose get route', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams,
      }
      params.request.method = 'GET'
      jest.spyOn(routes, routes.get.name).mockResolvedValue()
      await routes.handler(...params.values())
      expect(routes.get).toHaveBeenCalled()
    })
  })

  describe('GET', () => {
    test('given method get it should list all files downloaded', async () => {
      const route = new Routes()
      const params = {
        ...defaultParams,
      }
      const filesStatusesMock = [
        {
          size: '18 kb',
          birthtime: '2023-06-28T16:09:35.251Z',
          owner: 'eltoncampos1',
          file: 'file.png',
        },
      ]

      jest
        .spyOn(route.fileHelper, route.fileHelper.getFilesStatus.name)
        .mockResolvedValue(filesStatusesMock)

      params.request.method = 'GET'
      await route.handler(...params.values())

      expect(params.response.writeHead).toHaveBeenCalledWith(200)
      expect(params.response.end).toHaveBeenCalledWith(
        JSON.stringify(filesStatusesMock)
      )
    })
  })
})
