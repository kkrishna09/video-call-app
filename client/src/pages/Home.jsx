import React, { useRef, useEffect, useCallback } from "react";
import { useSocket } from "../providers/Socket.jsx";
import { useNavigate } from "react-router-dom";
const HomePage = () => {
  const navigate = useNavigate();
  const emailRef = useRef();
  const roomIdRef = useRef();
  const { socket } = useSocket();

  const handleRoomJoin = useCallback(
    ({ roomId }) => {
      navigate(`/room/${roomId}`);
    },
    [socket]
  );

  useEffect(() => {
    socket.on("room:join", handleRoomJoin);
    return ()=>{
      socket.off("room:join", handleRoomJoin);
    }
  
  }, [handleRoomJoin, socket]);

  const handleSubmit = useCallback(() => {
    socket.emit("room:join", {
      email: emailRef.current.value,
      roomId: roomIdRef.current.value,
    });
  },[emailRef,roomIdRef,socket])

  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <div className="flex flex-col justify-center  items-center gap-2">
        <input
          ref={emailRef}
          className="px-3 py-2 mr-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-300 w-4/5"
          type="email"
          placeholder="Enter your email"
        ></input>
        <input
          ref={roomIdRef}
          className="px-3 w-4/5 py-2 mr-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-300  "
          type="text"
          placeholder="Enter room code"
        ></input>
        <button
          onClick={handleSubmit}
          className=" px-3 rounded-sm py-2 bg-blue-500 text-white hover:bg-white  hover:text-blue-500 hover:border hover:border-blue-500 duration-200 hover:border-primary hover:rounded-md "
        >
          Enter Room
        </button>
      </div>
    </div>
  );
};

export default HomePage;
