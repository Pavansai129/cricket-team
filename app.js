const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
app.listen(3000);

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("server running at 3000");
  } catch (error) {
    console.log(`DB error ${error.message}`);
    process.exit(1);
  }
};

initializeDbServer();

function convertSnakeCaseToCamelCase(each) {
  return {
    playerId: each.player_id,
    playerName: each.player_name,
    jerseyNumber: each.jersey_number,
    role: each.role,
  };
}
//GET API
app.get("/players/", async (request, response) => {
  const playerNamesListQuery = `SELECT * FROM cricket_team;`;
  const playerNamesList = await db.all(playerNamesListQuery);
  response.send(
    playerNamesList.map((each) => convertSnakeCaseToCamelCase(each))
  );
});

//POST API
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const createPlayerSqlQuery = `INSERT INTO cricket_team (player_name, jersey_number, role) VALUES ("${playerName}", ${jerseyNumber}, "${role}");`;

  await db.run(createPlayerSqlQuery);
  response.send("Player Added to Team");
});

//GET API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuarry = `SELECT player_id as playerId, player_name as playerName, jersey_number as jerseyNumber, role FROM cricket_team WHERE player_id = ${playerId};`;
  const playerDetails = await db.get(getPlayerQuarry);
  response.send(playerDetails);
});

//PUT API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const playerDetailsUpdateQuarry = `UPDATE cricket_team SET player_name = "${playerName}", jersey_number = ${jerseyNumber}, role = "${role}" WHERE player_id = ${playerId};`;
  await db.run(playerDetailsUpdateQuarry);
  response.send("Player Details Updated");
});

//DELETE API
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuarry = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  await db.run(deletePlayerQuarry);
  response.send("Player Removed");
});

module.exports = app;
