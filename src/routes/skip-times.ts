import Elysia, { t } from "elysia";
import { prisma } from "..";

export const addController = new Elysia({ prefix: "/skip-times" })
  .post(
    "/add/tv",
    async ({ body }) => {
      const { id, season_number, episode_number, start_time, end_time, type } =
        body;

      // Check if TV show exists
      const tvShow = await prisma.tv.findUnique({
        where: { id },
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
        tvShow?.id &&
        tvShow.seasons &&
        tvShow.seasons[season_number]?.episodes
      ) {
        const seasonId = tvShow.seasons[season_number]?.id;
        const episodeId =
          tvShow.seasons[season_number].episodes[episode_number]?.id;

        if (seasonId && episodeId) {
          // Update existing episode with skip times
          await prisma.tv.update({
            where: { id },
            data: {
              seasons: {
                update: {
                  where: { id: seasonId },
                  data: {
                    episodes: {
                      update: {
                        where: { id: episodeId },
                        data: {
                          skip_times: {
                            create: { start_time, end_time, type },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
          return "Skip times updated successfully";
        }
      }

      // Create new TV show, season, episode, and skip times
      await prisma.tv.create({
        data: {
          id,
          title: "",
          seasons: {
            create: {
              season_number,
              episodes: {
                create: {
                  episode_number,
                  title: "",
                  skip_times: {
                    create: { start_time, end_time, type },
                  },
                },
              },
            },
          },
        },
      });

      return "TV show and skip times added successfully";
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
      const { tmdb_id, season_number, episode_number } = params;

      if (!tmdb_id || !season_number || !episode_number)
        return "Invalid parameters";

      try {
        const item = await prisma.tv.findUnique({
          where: { id: Number(tmdb_id) },

          select: {
            seasons: {
              select: {
                season_number: true,
                episodes: {
                  select: {
                    episode_number: true,
                    skip_times: {
                      select: {
                        start_time: true,
                        end_time: true,
                        up_votes: true,
                        down_votes: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!item) return "No skip times found for this item";

        const findSeason = item.seasons.find(
          (value) => value.season_number === parseInt(season_number)
        );

        if (!findSeason) return "No Skip time for this season";

        const findEpisode = findSeason.episodes.find(
          (value) => value.episode_number === parseInt(episode_number)
        );

        if (!findEpisode) return "No Skip time for this episode";

        return findEpisode.skip_times.sort(
          (a, b) => a.up_votes - b.up_votes
        )[0];
      } catch (error) {
        console.error(error);
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

      if (type === "up" && upVoteCookie) return "You have already upvoted";
      if (type === "down" && downVoteCookie)
        return "You have already downvoted";

      try {
        await prisma.skipTime.update({
          where: { id: Number(skip_id) },
          data: {
            up_votes: { increment: type === "up" ? 1 : 0 },
            down_votes: { increment: type === "down" ? 1 : 0 },
          },
        });

        // Set the appropriate cookie to expire in 24 hours
        const cookieName =
          type === "up" ? `upvoted_${skip_id}` : `downvoted_${skip_id}`;

        cookie[cookieName].set({
          maxAge: 24 * 60 * 60,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        return "Vote recorded";
      } catch (error) {
        console.error(error);
        return "Item not found with that skip id";
      }
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
