const { Server } = require("socket.io");

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

let onlineUsers = [];

io.on("connection", (socket) => {
  socket.on("addNewUser", (userId) => {
    if (!onlineUsers.find(user => user.userId === userId)) {
      onlineUsers.push({ userId, socketId: socket.id });
      io.emit("getUsers", onlineUsers);
    }
  });

  socket.on("sendMessage", (message) => {
    const user = onlineUsers.find(user => user.userId === message.receiverId);
    if (user) {
      io.to(user.socketId).emit("getMessage", message);
      io.to(user.socketId).emit("getNotification", {
        chatId: message.chatId,
        senderId: message.userId,
        isRead: false,
        date: new Date(),
      });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
    io.emit("getUsers", onlineUsers);
  });
});

io.listen(5001);
