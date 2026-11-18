import type { Request, Response } from "express"
import { z, type ZodType } from "zod"

type EndpointSchemas = {
  params?: ZodType
  query?: ZodType
  body?: ZodType
}

type InferOutput<T> = T extends ZodType ? z.output<T> : never

type EndpointData<S extends EndpointSchemas> = {
  [
    K in keyof S as [Extract<S[K], ZodType>] extends [never] ? never : K
  ]: InferOutput<Extract<S[K], ZodType>>
}

export const makeValidatedEndpoint =
  <S extends EndpointSchemas>(
    { params, query, body }: S,
    cb: (
      req: Request,
      res: Response,
      data: EndpointData<S>
    ) => Promise<void> | void
  ) =>
  (req: Request, res: Response) => {
    const paramsResult = params?.safeParse(req.params)
    const queryResult = query?.safeParse(req.query)
    const bodyResult = body?.safeParse(req.body)

    const errors: Record<string, unknown> = {}

    if (paramsResult && !paramsResult.success) {
      errors.params = z.flattenError(paramsResult.error)
    }

    if (queryResult && !queryResult.success) {
      errors.query = z.flattenError(queryResult.error)
    }

    if (bodyResult && !bodyResult.success) {
      errors.body = z.flattenError(bodyResult.error)
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        message: "Validation failed",
        errors,
      })
    }

    const data = {
      ...(paramsResult?.success && { params: paramsResult.data }),
      ...(queryResult?.success && { query: queryResult.data }),
      ...(bodyResult?.success && { body: bodyResult.data }),
    } as EndpointData<S>

    return cb(req, res, data)
  }
