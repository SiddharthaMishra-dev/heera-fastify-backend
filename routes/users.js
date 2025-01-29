import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/connection.js";
import { users } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

const router = async (fastify) => {
  // Create a new user
  fastify.post("/create", async (request, reply) => {
    const { username, password } = request.body;
    const id = uuidv4();
    const token = jwt.sign({ username, password }, process.env.TOKEN_SECRET);

    try {
      await db
        .insert(users)
        .values({ id, username, password, token, createAt: String(new Date()) })
        .onConflictDoNothing();
      reply.send({ error: false, msg: "", token });
    } catch (error) {
      console.log("Error:", error);
      reply.send({ error: true, msg: error.toString() });
    }
  });

  // User login
  fastify.post("/login", async (request, reply) => {
    const { username, password } = request.body;
    try {
      const result = await db
        .select()
        .from(users)
        .where(and(eq(users.username, username), eq(users.password, password)));

      if (result.length > 0) {
        reply.send({ error: false, msg: "", token: result[0].token, username: result[0].username });
      } else {
        throw new Error("No user found");
      }
    } catch (error) {
      reply.send({ error: true, msg: error.toString() });
    }
  });
};

export default router;
