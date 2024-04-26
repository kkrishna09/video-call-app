// import React, { useMemo } from "react";

// const PeerContext = React.createContext(null);

// export const usePeer = () => React.useContext(PeerContext);

// export const PeerProvider = (props) => {
//   const peer = useMemo(
//     () =>
//       new RTCPeerConnection({
//         iceServers: [
//           {
//             urls: [
//               "stun:stun.l.google.com:19302",
//               "stun:global.stun.twilio.com:3478",
//             ],
//           },
//         ],
//       }),
//     []
//   );

//   const createOffer = async () => {
//     const offer = await peer.createOffer();
//     await peer.setLocalDescription(offer);
//     return offer;
//   };

//   const createAnswer = async (offer) => {
//     await peer.setRemoteDescription(offer);
//     const answer = await peer.createAnswer();
//     peer.setLocalDescription(answer);
//     return answer;
//   };

//   return (
//     <PeerContext.Provider value={{ peer, createOffer, createAnswer }}>
//       {props.children}
//     </PeerContext.Provider>
//   );
// };
