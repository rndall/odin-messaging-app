import { reset, seed } from "drizzle-seed"

import { sql } from "drizzle-orm"
import * as schema from "./drizzle/schema.ts"
import { db } from "./index.ts"

// password123
const PASSWORD_HASH =
  "$2a$12$BDBCQVuGmdqt5xcEv0YffOtMCPsBiNCd6LpYBYcq5CIGYwiy65eRa"

async function main() {
  await reset(db, schema)
  await seed(db, schema).refine((f) => ({
    users: {
      columns: {
        username: f.firstName(),
        passwordHash: f.default({ defaultValue: PASSWORD_HASH }),
      },
    },
    messages: {
      columns: {
        content: f.loremIpsum(),
        editedAt: f.weightedRandom([
          { weight: 0.9, value: f.default({ defaultValue: null }) },
          {
            weight: 0.1,
            value: f.datetime(),
          },
        ]),
      },
    },
    profileInfo: {
      columns: {
        displayName: f.fullName(),
        bio: f.loremIpsum(),
      },
    },
    conversations: {
      columns: {
        name: f.country(),
      },
    },
  }))

  await db.update(schema.users).set({
    username: sql`lower(${schema.users.username})`,
  })
}

main()
