const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertingToCamelCase = (snake_case_array) => {
  const camelCaseArray = snake_case_array.map((eachObj) => {
    const camelCaseObj = {
      playerId: eachObj.player_id,
      playerName: eachObj.player_name,
      jerseyNumber: eachObj.jersey_number,
      role: eachObj.role,
    };
    return camelCaseObj;
  });

  return camelCaseArray;
};

// GET API

app.get("/players/", async (request, response) => {
  const getPlayersListQuery = `SELECT  * FROM  cricket_team; `;
  const playersArray = await db.all(getPlayersListQuery);
  const resultArray = convertingToCamelCase(playersArray);
  response.send(resultArray);
});

// POST API

app.post("/players/", async (request, response) => {
  const playerIds = request.body;
  const { playerName, jerseyNumber, role } = playerIds;
  const createPlayerDetailsQuery = `
        INSERT INTO
          cricket_team (player_name, jersey_number, role)
        VALUES ('${playerName}', ${jerseyNumber}, '${role}'); `;

  await db.run(createPlayerDetailsQuery);
  response.send("Player Added to Team");
});

// GET API (using player_id)

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `
    SELECT  *
    FROM
        cricket_team
    WHERE
        player_id = ${playerId} `;
  const playerObj = await db.get(getPlayerDetailsQuery);
  const resultObj = {
    playerId: playerObj.player_id,
    playerName: playerObj.player_name,
    jerseyNumber: playerObj.jersey_number,
    role: playerObj.role,
  };
  response.send(resultObj);
});

// UPDATE player API

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerDetailsQuery = `
    UPDATE
      cricket_team
    SET
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE
         player_id = ${playerId};
    `;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

//DELETE player from table API

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerDetailsQuery = `
    DELETE FROM
      cricket_team
    WHERE
        player_id = ${playerId};
    `;
  await db.run(deletePlayerDetailsQuery);
  response.send("Player Removed");
});

module.exports = app;
