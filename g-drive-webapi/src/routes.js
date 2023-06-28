import { logger } from "./logger.js"

export default class Routes {
    constructor(){}

    setSocketInstance(io) {
        this.io = io
    }

    async defaultRoute(req, res){
        res.end("Hello World")
    }

    async options(req, res){
        res.writeHead(204)
        res.end("Hello World")
    }

    async post(req, res){
        logger.info("post")
        res.end()
    }

    async get(req, res){
        logger.info("get")
        res.end()
    }

    handler(req, res){
        res.setHeader("Access-Control-allow-Origin", "*")
        const chosen = this[req.method.toLowerCase()] || this.defaultRoute
        return chosen.apply(this, [req, res])
    }
}