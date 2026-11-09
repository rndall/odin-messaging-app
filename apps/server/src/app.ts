import compression from "compression"
import express, {
  Router,
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express"
import helmet from "helmet"
import createError from "http-errors"

const app: Express = express()

app.use(helmet())
app.use(compression())

const apiRouter = Router()

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

export { app }
