import { useState, useEffect } from 'react';
import { Movie, User, UserMovieRelation } from './types';

// Komponent główny
function App() {
  // Stany do przechowywania danych
  const [users, setUsers] = useState<User[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchedList, setWatchedList] = useState<UserMovieRelation[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [userName, setUserName] = useState('');
  const [movieTitle, setMovieTitle] = useState('');

  const apiUrl = 'https://chmury-obliczeniowe-adel-m-gibas-projects.vercel.app';

  // Funkcja do pobierania danych
  useEffect(() => {
    async function fetchData() {
      // Pobierz listę użytkowników
      const usersResponse = await fetch(`${apiUrl}/users`);
      const usersData = await usersResponse.json();
      setUsers(usersData);

      // Pobierz listę filmów
      const moviesResponse = await fetch(`${apiUrl}/movies`);
      const moviesData = await moviesResponse.json();
      setMovies(moviesData);

      // Pobierz listę obejrzanych filmów
      const watchedResponse = await fetch(`${apiUrl}/watched`);
      const watchedData = await watchedResponse.json();
      setWatchedList(watchedData);
    }

    fetchData();
  }, []); // Pusta zależność, aby useEffect działał tylko raz po zamontowaniu komponentu

  // Funkcja do obsługi dodawania użytkownika
  const handleAddUser = async () => {
    const response = await fetch(`${apiUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newUserName }),
    });

    if (response.ok) {
      const newUser = await response.json();
      setUsers([...users, newUser]);
    } else {
      console.error('Failed to add user');
      alert('Failed to add user');
    }

    setNewUserName(''); // Wyczyszczenie pola po dodaniu użytkownika
  };

  // Funkcja do obsługi dodawania filmu
  const handleAddMovie = async () => {
    const response = await fetch(`${apiUrl}/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: newMovieTitle }),
    });

    if (response.ok) {
      const newMovie = await response.json();
      setMovies([...movies, newMovie]);
    } else {
      console.error('Failed to add movie');
      alert('Failed to add movie');
    }

    setNewMovieTitle(''); // Wyczyszczenie pola po dodaniu filmu
  };

  // Funkcja do obsługi dodawania obejrzanego filmu
  const handleAddWatched = async () => {
    const response = await fetch(`${apiUrl}/watched`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName: userName, movieTitle: movieTitle }),
    });

    if (response.ok) {
      const watchedResponse = await fetch(`${apiUrl}/watched`);
      const watchedData = await watchedResponse.json();
      setWatchedList(watchedData);
    } else {
      console.error('Failed to add watched relationship');
      alert('Failed to add watched relationship');
    }

    setUserName(''); // Wyczyszczenie pola po dodaniu relacji
    setMovieTitle(''); // Wyczyszczenie pola po dodaniu relacji
  };

  // Funkcja do usuwania użytkownika
  const handleDeleteUser = async (name: string) => {
    const response = await fetch(`${apiUrl}/users/${name}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setUsers(users.filter((user) => user.name !== name));
    } else {
      console.error('Failed to delete user');
      alert('Failed to delete user');
    }
  };

  // Funkcja do usuwania filmu
  const handleDeleteMovie = async (title: string) => {
    const response = await fetch(`${apiUrl}/movies/${title}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setMovies(movies.filter((movie) => movie.title !== title));
    } else {
      console.error('Failed to delete movie');
      alert('Failed to delete movie');
    }
  };

  // Funkcja do usuwania relacji obejrzanego filmu
  const handleDeleteWatched = async (userName: string, movieTitle: string) => {
    const response = await fetch(`${apiUrl}/watched/${userName}/${movieTitle}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setWatchedList(watchedList.filter((relationship) => !(relationship.user.name === userName && relationship.movie.title === movieTitle)));
    } else {
      console.error('Failed to delete watched relationship');
      alert('Failed to delete watched relationship');
    }
  };

  return (
    <div>
      <h1>Movie Watchlist App</h1>

      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.name}>
          {user.name}
          <button type="button" onClick={() => handleDeleteUser(user.name)}>
            Delete
          </button>
        </li>
        ))}
      </ul>
      <form>
        <label htmlFor="add-user-name">User Name:</label>
        <input
          type="text"
          id="add-user-name"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          required
        />
        <button type="button" onClick={handleAddUser}>
          Add User
        </button>
      </form>

      <h2>Movies</h2>
      <ul>
        {movies.map((movie) => (
          <li key={movie.title}>
          {movie.title}
          <button type="button" onClick={() => handleDeleteMovie(movie.title)}>
            Delete
          </button>
        </li>
        ))}
      </ul>
      <form>
        <label htmlFor="add-movie-title">Movie Title:</label>
        <input
          type="text"
          id="add-movie-title"
          value={newMovieTitle}
          onChange={(e) => setNewMovieTitle(e.target.value)}
          required
        />
        <button type="button" onClick={handleAddMovie}>
          Add Movie
        </button>
      </form>

      <h2>Watched Movies</h2>
      <ul>
        {watchedList.map((relationship) => {
          const user = users.find((u) => u.name === relationship.user.name);
          const movie = movies.find((m) => m.title === relationship.movie.title);
          return (
            user &&
            movie && (
              <li key={`${user.name}-${movie.title}`}>
                {user.name} watched {movie.title}
                <button type="button" onClick={() => handleDeleteWatched(user.name, movie.title)}>
                  Delete
                </button>
              </li>
            )
          );
        })}
      </ul>
      <form>
        <label htmlFor="user-name">User Name:</label>
        <input
          type="text"
          id="user-name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <label htmlFor="movie-title">Movie Title:</label>
        <input
          type="text"
          id="movie-title"
          value={movieTitle}
          onChange={(e) => setMovieTitle(e.target.value)}
          required
        />
        <button type="button" onClick={handleAddWatched}>
          Add Watched
        </button>
      </form>
    </div>
  );
}

// Eksportuj komponent główny
export default App;
