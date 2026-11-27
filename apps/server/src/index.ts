import { server } from "./app.ts"
import { env } from "./env.ts"
import { setupSocket } from "./lib/socket.ts"

setupSocket(server)

server.listen(env.PORT, () => {
  console.log("Listening on port", env.PORT)
})
