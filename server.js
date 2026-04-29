const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;

const wss = new WebSocket.Server({ port: PORT });

const players = {};

console.log("Server started on port " + PORT);

function broadcast(data) {
  const msg = JSON.stringify(data);

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

wss.on("connection", ws => {
  let playerName = null;

  console.log("Player connected");

  ws.on("message", message => {
    try {
      const data = JSON.parse(message);

      // Игрок двигается
      if (data.type === "move") {
        playerName = data.name;

        players[playerName] = {
          name: data.name,
          x: data.x,
          y: data.y,
          dir: data.dir,
          step: data.step,
          shirt: data.shirt,
          face: data.face
        };

        broadcast({
          type: "players",
          players: Object.values(players)
        });
      }
    } catch (err) {
      console.log("Error:", err.message);
    }
  });

  ws.on("close", () => {
    console.log("Player disconnected");

    if (playerName) {
      delete players[playerName];

      broadcast({
        type: "leave",
        name: playerName
      });
    }
  });
});
