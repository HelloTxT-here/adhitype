import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

// Random texts for racing
const raceTexts = [
  "just from it after want even by work open develop day now little this present and no since see here too while much with public because might govern now",
  "Programming is the process of creating a set of instructions that tell a computer how to perform a task. It can be done using a variety of computer programming languages.",
  "The most important property of a program is whether it accomplishes the intention of its user. This depends on many factors including the correctness of the underlying algorithms.",
  "A software developer is a person that creates software, either by themselves or in conjunction with others. They have a strong understanding of computer science principles.",
  "Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it."
];

const quotes = [
  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Believe you can and you're halfway there. The only limit to our realization of tomorrow will be our doubts of today.",
  "Your time is limited, so don't waste it living someone else's life.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Stay hungry, stay foolish.",
  "Innovation distinguishes between a leader and a follower."
];

  // Socket.io logic for real-time multiplayer typing race
  const rooms = new Map<string, any>();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join_match", ({ type, user }) => {
      // Find an available waiting room of the specified type
      let room = Array.from(rooms.values()).find(r => 
          r.status === "waiting" && 
          r.type === type && 
          Object.keys(r.players).length < 5
      );

      let roomId;
      if (room) {
        roomId = room.id;
      } else {
        roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
        rooms.set(roomId, {
          id: roomId,
          type,
          players: {},
          status: "waiting",
          text: type === "quotes" 
            ? quotes[Math.floor(Math.random() * quotes.length)]
            : raceTexts[Math.floor(Math.random() * raceTexts.length)]
        });
        room = rooms.get(roomId);
      }

      socket.join(roomId);
      room.players[socket.id] = { id: socket.id, ...user, progress: 0, wpm: 0 };
      
      io.to(roomId).emit("room_update", room);
      console.log(`User ${socket.id} joined ${type} match in room ${roomId}`);
    });

    socket.on("update_progress", ({ roomId, progress, wpm }) => {
      const room = rooms.get(roomId);
      if (room && room.players[socket.id]) {
        room.players[socket.id].progress = progress;
        room.players[socket.id].wpm = wpm;
        io.to(roomId).emit("room_update", room);
      }
    });

    socket.on("start_race", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (room && room.status === "waiting") {
        room.status = "playing";
        io.to(roomId).emit("race_started", { startTime: Date.now() + 3000 }); // starts in 3 seconds
        io.to(roomId).emit("room_update", room);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      rooms.forEach((room, roomId) => {
        if (room.players[socket.id]) {
          delete room.players[socket.id];
          if (Object.keys(room.players).length === 0) {
            rooms.delete(roomId);
          } else {
            io.to(roomId).emit("room_update", room);
          }
        }
      });
    });
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production (after build), serve static files from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
