import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/Socket";
import ReactPlayer from "react-player";
import peer from "../service/peer";
const RoomPage = () => {
  const { socket } = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("call:user", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { email, id } = data;
      console.log("new user joined ", email, "room id", id);
      setRemoteSocketId(id);
    },
    [socket]
  );

  const handleIncommingCall = useCallback(async ({ from, offer }) => {
    setRemoteSocketId(from);
    console.log("incoming call : ", from, offer);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    console.log(`Incoming Call`, from, offer);
    const ans = await peer.getAnswer(offer);
    console.log(ans);
    socket.emit("call:accepted", { to: from, ans });
  }, []);

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    async ({ from, ans }) => {
      await peer.setLocalDescription(ans);
      console.log("call accepted");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  };

  const handleNegoNeededIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  // use effect for webRTC peer
  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("tracks !!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleNewUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeededIncoming);
    socket.on("peer:nego:final", handleNegoFinal);
    return () => {
      socket.off("user:joined", handleNewUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeededIncoming);
      socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [
    handleNewUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoFinal,
    handleNegoNeeded,
    socket,
  ]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-semibold mb-4">Video Call</h1>
      <div className="flex justify-between w-full mb-4">
        <h2 className="text-lg">
          {remoteSocketId ? "Connected" : "No one in room"}
        </h2>
        {remoteSocketId && (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCallUser}
          >
            Call
          </button>
        )}
      </div>
      {myStream && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          onClick={sendStreams}
        >
          Turn on Video
        </button>
      )}
      <div className="grid grid-cols-2 gap-4">
        {myStream && (
          <div>
            <h1 className="text-xl font-semibold mb-2">My Stream</h1>
            <ReactPlayer
              playing={true}
              muted
              height={"300px"}
              width={"100%"}
              url={myStream}
            />
          </div>
        )}
        {remoteStream && (
          <div>
            <h1 className="text-xl font-semibold mb-2">Remote Stream</h1>
            <ReactPlayer
              playing={true}
              muted
              height={"300px"}
              width={"100%"}
              url={remoteStream}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;
