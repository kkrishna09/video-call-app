
import { Server } from "socket.io";

const io = new Server(8001,{
  cors: true,
});
const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);


  socket.on("room:join", (data) => {
    const { roomId, email } = data;
    emailToSocketMapping.set(email, socket.id);
    socketToEmailMapping.set(socket.id, email);
    io.to(roomId).emit("user:joined", {email,id:socket.id});
    socket.join(roomId);
    io.to(socket.id).emit("room:join", data);
  });


  socket.on("call:user",({to,offer})=>{
    io.to(to).emit("incomming:call",{from : socket.id,offer})
  } )

  socket.on("call:accepted",({to,ans})=> {
    io.to(to).emit("call:accepted",{from : socket.id,ans})
  })

  socket.on("peer:nego:needed",({to,offer})=>{
    io.to(to).emit("peer:nego:needed",{from : socket.id,offer})
  })

  socket.on("peer:nego:done",({to,ans})=>{
    io.to(to).emit("peer:nego:final",{from : socket.id,ans})

  })
});



