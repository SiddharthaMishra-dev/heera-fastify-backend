import { db } from "./db/connection.js";

export async function authenticationMiddleware(req, reply) {
  try {
    const result = await db.query.users.findMany();
    if (result.find((usr) => usr.token === req.headers.authorization)) {
      req.hasKey = true;
    } else {
      return reply.status(401).send({
        error: true,
        msg: "You are not authorized",
      });
    }
  } catch (error) {
    return reply.status(500).send({
      error: true,
      msg: error.toString(),
    });
  }
}
