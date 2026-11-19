import request from "supertest"

export const describeUnauthorized = (makeRequest: () => request.Test) => {
  describe("authentication", () => {
    test.each([
      { description: "no token", authorization: undefined },
      { description: "invalid token", authorization: "Bearer invalid" },
    ])("returns 401 with $description", async ({ authorization }) => {
      const req = makeRequest().set(
        authorization ? { Authorization: authorization } : {}
      )
      const res = await req

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(401)
    })
  })
}
