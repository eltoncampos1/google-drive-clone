import https from "https"
import fs from "fs"
import { Server } from "socket.io"

import { logger } from "./logger.js"
import Routes from "./routes.js"

const PORT = process.env.PORT || 3000
const routes = new Routes()

const localHostSSL = {
    key: fs.readFileSync("./certificates/key.pem"),
    cert: fs.readFileSync("./certificates/cert.pem"),
}

const server = https.createServer(
    localHostSSL,
    routes.handler.bind(routes)
)

const io = new Server(server, {
    cors: {
        origin: "*",
        credentials: false
    }
})

routes.setSocketInstance(io)

io.on("connection", (socket) => logger.info(`someone connected:: ${socket.id}`))

const startServer = () => {
    const { address, port } = server.address()
    logger.info(`App running at https://${address}:${port}`)
}

server.listen(PORT, startServer)