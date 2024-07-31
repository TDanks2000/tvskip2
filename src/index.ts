import { cookie } from "@elysiajs/cookie";
import { swagger } from "@elysiajs/swagger";
import { PrismaClient } from "@prisma/client";
import { TMDB } from "@tdanks2000/tmdb-wrapper";
import { Elysia } from "elysia";
import { addController } from "./routes";

export const tmdb = new TMDB(process.env.tmdb_api_key as string);
export const prisma = new PrismaClient();

const port = process.env.PORT ?? 3002;

const app = new Elysia()
  .use(cookie())
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: "TvSkip API",
          version: "0.0.1",
          description: "The docs for the TvSkip API",
        },
      },
    })
  )
  .use(addController)
  .listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
