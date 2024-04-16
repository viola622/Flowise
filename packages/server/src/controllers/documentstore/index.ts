import { DocumentStoreDTO } from '../../services/documentstore/DocumentStoreDTO'
// @ts-ignore
import { getStoragePath } from 'flowise-components'
import fs from 'fs'
import path from 'path'
import { NextFunction, Request, Response } from 'express'
import { convertToValidFilename } from '../../utils'
import documentStoreService from '../../services/documentstore'
import { DocumentStore } from '../../database/entities/DocumentStore'

const createDocumentStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.body === 'undefined') {
            throw new Error(`Error: documentStoreController.createDocumentStore - body not provided!`)
        }
        const body = req.body
        const subFolder = convertToValidFilename(body.name)
        const dir = path.join(getStoragePath(), 'datasource', subFolder)
        if (fs.existsSync(dir)) {
            return res.status(500).send(new Error(`Document store ${body.name} already exists. Subfolder: ${subFolder}`))
        } else {
            fs.mkdirSync(dir, { recursive: true })
        }
        const docStore = DocumentStoreDTO.toEntity(body)
        const apiResponse = await documentStoreService.createDocumentStore(docStore)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}
const getAllDocumentStores = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const apiResponse = await documentStoreService.getAllDocumentStores()
        return res.json(DocumentStoreDTO.fromEntities(apiResponse))
    } catch (error) {
        next(error)
    }
}
const deleteLoaderFromDocumentStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const storeId = req.params.id
        const loaderId = req.params.loaderId

        if (!storeId || !loaderId) {
            return res.status(500).send(new Error(`Document store loader delete missing key information.`))
        }
        const apiResponse = await documentStoreService.deleteLoaderFromDocumentStore(storeId, loaderId)
        return res.json(DocumentStoreDTO.fromEntity(apiResponse))
    } catch (error) {
        next(error)
    }
}

// const uploadFileToDocumentStore = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const body = req.body
//         if (!req.params.id || !body.uploadFiles) {
//             return res.status(500).send(new Error(`Document store upload missing key information.`))
//         }
//
//         const apiResponse = await documentStoreService.uploadFileToDocumentStore(body.storeId, body.uploadFiles)
//         return res.json(DocumentStoreDTO.fromEntity(apiResponse))
//     } catch (error) {
//         next(error)
//     }
// }

const getDocumentStoreById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params.id === 'undefined' || req.params.id === '') {
            throw new Error('Error: documentStoreController.getDocumentStoreById - id not provided!')
        }

        const apiResponse = await documentStoreService.getDocumentStoreById(req.params.id)
        return res.json(DocumentStoreDTO.fromEntity(apiResponse))
    } catch (error) {
        next(error)
    }
}

const getDocumentStoreFileChunks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params.storeId === 'undefined' || req.params.storeId === '') {
            throw new Error('Error: documentStoreController.getDocumentStoreFileChunks - storeId not provided!')
        }
        if (typeof req.params.fileId === 'undefined' || req.params.fileId === '') {
            throw new Error('Error: documentStoreController.getDocumentStoreFileChunks - fileId not provided!')
        }

        const apiResponse = await documentStoreService.getDocumentStoreFileChunks(req.params.storeId, req.params.fileId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const deleteDocumentStoreFileChunk = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params.storeId === 'undefined' || req.params.storeId === '') {
            throw new Error('Error: documentStoreController.deleteDocumentStoreFileChunk - storeId not provided!')
        }
        if (typeof req.params.loaderId === 'undefined' || req.params.loaderId === '') {
            throw new Error('Error: documentStoreController.deleteDocumentStoreFileChunk - loaderId not provided!')
        }
        if (typeof req.params.chunkId === 'undefined' || req.params.chunkId === '') {
            throw new Error('Error: documentStoreController.deleteDocumentStoreFileChunk - chunkId not provided!')
        }

        const apiResponse = await documentStoreService.deleteDocumentStoreFileChunk(
            req.params.storeId,
            req.params.loaderId,
            req.params.chunkId
        )
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const editDocumentStoreFileChunk = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params.storeId === 'undefined' || req.params.storeId === '') {
            throw new Error('Error: documentStoreController.editDocumentStoreFileChunk - storeId not provided!')
        }
        if (typeof req.params.loaderId === 'undefined' || req.params.loaderId === '') {
            throw new Error('Error: documentStoreController.editDocumentStoreFileChunk - loaderId not provided!')
        }
        if (typeof req.params.chunkId === 'undefined' || req.params.chunkId === '') {
            throw new Error('Error: documentStoreController.editDocumentStoreFileChunk - chunkId not provided!')
        }
        const body = req.body
        if (typeof body === 'undefined' || body.pageContent === 'undefined' || body.pageContent === '') {
            throw new Error('Error: documentStoreController.editDocumentStoreFileChunk - body not provided!')
        }
        const apiResponse = await documentStoreService.editDocumentStoreFileChunk(
            req.params.storeId,
            req.params.loaderId,
            req.params.chunkId,
            body.pageContent
        )
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const processFileChunks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.body === 'undefined') {
            throw new Error('Error: documentStoreController.processFileChunks - body not provided!')
        }
        const body = req.body
        const apiResponse = await documentStoreService.processAndSaveChunks(body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const updateDocumentStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params.id === 'undefined' || req.params.id === '') {
            throw new Error('Error: documentStoreController.updateDocumentStore - id not provided!')
        }
        if (typeof req.body === 'undefined') {
            throw new Error('Error: documentStoreController.updateDocumentStore - body not provided!')
        }
        const store = await documentStoreService.getDocumentStoreById(req.params.id)
        if (!store) {
            return res.status(404).send(`DocumentStore ${req.params.id} not found in the database`)
        }
        const body = req.body
        const updateDocStore = new DocumentStore()
        Object.assign(updateDocStore, body)
        const apiResponse = await documentStoreService.updateDocumentStore(store, updateDocStore)
        return res.json(DocumentStoreDTO.fromEntity(apiResponse))
    } catch (error) {
        next(error)
    }
}

const previewFileChunks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.body === 'undefined') {
            throw new Error('Error: documentStoreController.previewFileChunks - body not provided!')
        }
        const body = req.body
        body.preview = true
        const apiResponse = await documentStoreService.previewChunks(body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getDocumentLoaders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const apiResponse = await documentStoreService.getDocumentLoaders()
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

export default {
    createDocumentStore,
    getAllDocumentStores,
    deleteLoaderFromDocumentStore,
    getDocumentStoreById,
    getDocumentStoreFileChunks,
    updateDocumentStore,
    processFileChunks,
    previewFileChunks,
    getDocumentLoaders,
    deleteDocumentStoreFileChunk,
    editDocumentStoreFileChunk
}