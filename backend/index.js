const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Konfiguracja połączenia z bazą Neo4j
const driver = neo4j.driver(
  'neo4j+s://baad7c69.databases.neo4j.io', // Adres i port bazy Neo4j
  neo4j.auth.basic('neo4j', 'cuKVUMv2lf15sexIGK0_IezdRrM0hvhPMfp8jxABa6M') // Login i hasło do bazy Neo4j
);

// Endpoint do pobierania wszystkich użytkowników
app.get('/api/users', async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run('MATCH (u:User) RETURN u');
    const users = result.records.map(record => record.get('u').properties);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await session.close();
  }
});

// Endpoint do pobierania wszystkich filmów
app.get('/api/movies', async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run('MATCH (m:Movie) RETURN m');
    const movies = result.records.map(record => record.get('m').properties);
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await session.close();
  }
});

// Endpoint do pobierania relacji użytkownik-film
app.get('/api/watched', async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run('MATCH (u:User)-[:WATCHED]->(m:Movie) RETURN u, m');
    const watched = result.records.map(record => ({
      user: record.get('u').properties,
      movie: record.get('m').properties
    }));
    res.json(watched);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await session.close();
  }
});

// Endpoint do dodawania nowego użytkownika
app.post('/api/users', async (req, res) => {
  const session = driver.session();
  const { name } = req.body;

  try {
    const result = await session.run('CREATE (u:User {name: $name}) RETURN u', { name });
    const newUser = result.records[0].get('u').properties;
    res.json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await session.close();
  }
});

// Endpoint do dodawania nowego filmu
app.post('/api/movies', async (req, res) => {
  const session = driver.session();
  const { title } = req.body;

  try {
    const result = await session.run('CREATE (m:Movie {title: $title}) RETURN m', { title });
    const newMovie = result.records[0].get('m').properties;
    res.json(newMovie);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await session.close();
  }
});

// Endpoint do dodawania relacji użytkownik-film
app.post('/api/watched', async (req, res) => {
    const session = driver.session();
    const { userName, movieTitle } = req.body;
  
    try {
      await session.run(
        'MATCH (u:User {name: $userName}), (m:Movie {title: $movieTitle}) MERGE (u)-[:WATCHED]->(m)',
        {
          userName,
          movieTitle,
        }
      );
      res.status(201).send('Relationship created successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } finally {
      await session.close();
    }
  });


  app.delete('/api/users/:name', async (req, res) => {
    const session = driver.session();
    const userName = req.params.name;
  
    try {
      await session.run('MATCH (u:User) WHERE u.name = $userName DETACH DELETE u', {
        userName: userName,
      });
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } finally {
      await session.close();
    }
  });
  
  // Usuwanie
  
  app.delete('/api/movies/:title', async (req, res) => {
    const session = driver.session();
    const movieTitle = req.params.title;
  
    try {
      await session.run('MATCH (m:Movie) WHERE m.title = $movieTitle DETACH DELETE m', {
        movieTitle: movieTitle,
      });
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } finally {
      await session.close();
    }
  });
  
  app.delete('/api/watched/:userName/:movieTitle', async (req, res) => {
    const session = driver.session();
    const userName = req.params.userName;
    const movieTitle = req.params.movieTitle;
  
    try {
      await session.run(
        'MATCH (u:User)-[w:WATCHED]->(m:Movie) WHERE u.name = $userName AND m.title = $movieTitle DELETE w',
        {
          userName: userName,
          movieTitle: movieTitle,
        }
      );
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } finally {
      await session.close();
    }
  });

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = driver;
module.exports = app;