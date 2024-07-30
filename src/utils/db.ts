import { Episode } from "@tdanks2000/tmdb-wrapper";
import { tmdb } from "..";

class DB {
  private tmdb = tmdb;

  async getMovie(id: number) {
    const data = await this.tmdb.movies.details(id);
    return data;
  }

  async getTvShow(id: number) {
    const data = await this.tmdb.tvShows.details(id);
    return data;
  }

  async getEpisodes(id: number, season: number) {
    const data = await this.tmdb.tvShows.season(id, season);
    return data;
  }

  async newItemMovieData(id: number) {
    return await this.getMovie(id);
  }

  async newItemTvData(id: number) {
    const tv = await this.getTvShow(id);

    let episodes: {
      [season: number]: Episode[];
    } = {};

    for await (const { season_number } of tv.seasons) {
      const episodesReq = await this.getEpisodes(id, season_number);

      episodes[season_number] = episodesReq.episodes;
    }

    return {
      ...tv,
      episodes,
    };
  }
}
