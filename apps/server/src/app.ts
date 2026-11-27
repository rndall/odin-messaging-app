import compression from "compression"
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express"
import helmet from "helmet"
import createError from "http-errors"
import { createServer } from "node:http"

import { apiRouter } from "./routes/api.ts"

const app: Express = express()
const server = createServer(app)

app.use(helmet())
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  if (req.method === "OPTIONS") return res.sendStatus(204)
  next()
})
app.use(compression())

app.use(express.json())

app.use("/api", apiRouter)

app.use((_req, _res, next) => {
  next(createError(404))
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)

  const isHttpError = createError.isHttpError(err)

  const status = isHttpError ? err.status : 500
  const message =
    isHttpError && err.expose ? err.message : "Internal Server Error"

  return res.status(status).json({ message })
})

export { app, server }
