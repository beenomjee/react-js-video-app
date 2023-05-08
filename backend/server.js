import app from "./app.js";
import { connect } from "./db/index.js";
import { Server } from "socket.io";
import http from "http";

const httpApp = http.createServer(app);

const io = new Server(httpApp, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
});

const users = {};

io.on("connection", (socket) => {
  socket.on("login", ({ email }) => {
    users[email] = {
      socketId: socket.id,
      isAvailable: true,
      candidates: [],
    };
    socket.email = email;

    io.emit("user-changed", { users });
  });

  socket.on("call", ({ email, offer }) => {
    const recipent = users[email];
    io.to(recipent.socketId).emit("incoming-call", {
      from: socket.email,
      offer,
      candidates: users[socket.email].candidates,
    });
  });

  socket.on("reject", ({ email }) => {
    const sender = users[email];
    io.to(sender.socketId).emit("call-rejected", { from: socket.email });
  });

  socket.on("accept", ({ email, answer }) => {
    const sender = users[email];
    io.to(sender.socketId).emit("call-accepted", {
      from: socket.email,
      answer,
    });
    sender.isAvailable = false;
    users[socket.email].isAvailable = false;
    io.emit("user-changed", { users });
  });

  socket.on("end", ({ email }) => {
    try {
      const otherUser = users[email];
      io.to(otherUser.socketId).emit("call-ended", { from: socket.email });
      otherUser.isAvailable = true;
      users[socket.email].isAvailable = true;
      io.emit("user-changed", { users });
    } catch (err) {}
  });

  socket.on("candidate", ({ email, candidate }) => {
    const recipent = users[email];
    users[socket.email].candidates.push(candidate);
    try {
      io.to(recipent.socketId).emit("candidate", {
        from: socket.email,
        candidates: users[socket.email].candidates,
      });
    } catch (err) {}
  });
});

// port
const port = process.env.PORT || 3001;
httpApp.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`Server listening on ${port}`);
  connect();
});
