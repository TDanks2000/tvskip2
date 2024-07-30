import Elysia, { t } from "elysia";
import { prisma } from "..";

export const addController = new Elysia({ prefix: "/skip-times" }).post(
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
);
