export interface User {
  name: string;
  watchedMovies: Movie[];
}

export interface Movie {
  title: string;
}

export interface UserMovieRelation {
  user: User;
  movie: Movie;
}
