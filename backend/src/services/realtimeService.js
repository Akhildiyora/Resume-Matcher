let ioInstance = null;

exports.setIo = (socketServer) => {
  ioInstance = socketServer;
  ioInstance.on("connection", (socket) => {
    console.info("Realtime client connected", socket.id);
    socket.on("disconnect", () => {
      console.info("Realtime client disconnected", socket.id);
    });
  });
};

exports.emitScoreUpdate = (payload) => {
  if (!ioInstance) return;
  try {
    ioInstance.emit("score-update", payload);
  } catch (err) {
    console.warn("Realtime emit failed", err.message);
  }
};
