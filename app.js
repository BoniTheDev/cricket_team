const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let database = null;

const intializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB: Error ${error.message}`);
    process.exit(1);
  }
};
intializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// Get Players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team;`;
  const playersArray = await database.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

// Create Player API

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `
                     INSERT INTO
                        cricket_team (player_name,jersey_number,role)
                    VALUES ('${playerName}','${jerseyNumber}','${role}');`;

  const dbResponse = await database.run(addPlayer);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//GET a Player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      cricket_team 
    WHERE 
      player_id = ${playerId};`;
  const player = await database.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

// Update Player API

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const teamPlayerDetails = request.body;
  const { playerName, jerseyNumber, role } = teamPlayerDetails;
  const updatePlayerDetails = `
                               UPDATE 
                                  cricket_team
                               SET 
                                  player_name = '${playerName}',
                                  jersey_number = '${jerseyNumber}',
                                  role = '${role}'
                               WHERE
                                  player_id = '${playerId}';`;
  await database.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

// Delete Player API

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
                         DELETE FROM
                            cricket_team 
                        WHERE
                          player_id = ${playerId};`;
  await database.get(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
