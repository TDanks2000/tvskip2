import Elysia, { t } from "elysia";
import { prisma } from "..";

export const addController = new Elysia({ prefix: "/skip-times" })
  .post(
    "/add/tv",
    async ({ body }) => {
      const isAvailable = await prisma.tv.findUnique({
        where: {
          id: body.id,
        },
        select: {
          first_air_date: true,
          seasons: {
            select: {
              id: true,
              episodes: true,
            },
          },
          id: true,
        },
      });

      if (
        isAvailable?.id &&
        isAvailable.seasons &&
        isAvailable.seasons[body.season_number].episodes
      ) {
        prisma.tv.update({
          where: {
            id: body.id,
          },
          data: {
            seasons: {
              update: {
                where: {
                  id: isAvailable.seasons[body.season_number]?.id,
                },
                data: {
                  episodes: {
                    update: {
                      where: {
                        id: isAvailable.seasons[body.season_number].episodes[
                          body.episode_number
                        ].id,
                      },
                      data: {
                        skip_times: {
                          create: {
                            end_time: body.end_time,
                            start_time: body.start_time,
                            type: body.type,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });
      }

      await prisma.tv.create({
        data: {
          id: body.id,
          title: "",
          seasons: {
            create: {
              season_number: body.season_number,
              episodes: {
                create: {
                  episode_number: body.episode_number,
                  title: "",
                  skip_times: {
                    create: {
                      end_time: body.end_time,
                      start_time: body.start_time,
                      type: body.type,
                    },
                  },
                },
              },
            },
          },
        },
      });
    },
    {
      body: t.Object({
        id: t.Number(),
        season_number: t.Number(),
        episode_number: t.Number(),
        type: t.Enum({
          recap: "recap",
          intro: "intro",
          outro: "outro",
        }),
        start_time: t.Number(),
        end_time: t.Number(),
      }),
    }
  )
  .get(
    "/get/tv/:tmdb_id/:season_number/:episode_number",
    async ({ params }) => {
      try {
        const { tmdb_id, season_number, episode_number } = params;

        if (!tmdb_id || !season_number || !episode_number) return;

        const item = await prisma.tv.findUnique({
          where: {
            id: Number(tmdb_id),
          },
          include: {
            seasons: {
              where: {
                season_number: Number(season_number),
              },
              include: {
                episodes: {
                  where: {
                    episode_number: Number(episode_number),
                  },
                },
              },
            },
          },
        });

        if (!item) return "No skip times found for this item";
        return item;
      } catch (error) {
        console.log(error);

        throw new Error("Something went wrong");
      }
    }
  )
  .get(
    "/vote/tv/:skip_id/:type",
    async ({ params, cookie }) => {
      const { skip_id, type } = params;

      if (!skip_id) return "Invalid skip_id";

      if (type !== "up" && type !== "down") return "Invalid vote type";

      const upVoteCookie = cookie[`upvoted_${skip_id}`];
      const downVoteCookie = cookie[`downvoted_${skip_id}`];

      if (type === "up" && upVoteCookie) {
        return "You have already upvoted";
      }

      if (type === "down" && downVoteCookie) {
        return "You have already downvoted";
      }

      await prisma.skipTime.update({
        where: {
          id: Number(skip_id),
        },
        data: {
          up_votes: {
            increment: type === "up" ? 1 : 0,
          },
          down_votes: {
            increment: type === "down" ? 1 : 0,
          },
        },
      });

      // Set the appropriate cookie to expire in 24 hours
      if (type === "up") {
        cookie[`upvoted_${skip_id}`].set({
          maxAge: 24 * 60 * 60,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
      } else if (type === "down") {
        cookie[`downvoted_${skip_id}`].set({
          maxAge: 24 * 60 * 60,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
      }

      return "Vote recorded";
    },
    {
      params: t.Object({
        skip_id: t.Number(),
        type: t.Enum({
          up: "up",
          down: "down",
        }),
      }),
    }
  );
