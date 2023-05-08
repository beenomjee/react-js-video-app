import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./useAuth";
import { useEmail } from "./useEmail";

export const useWebSocket = (webRTC, localStremRef, remoteStremRef) => {
  const socketRef = useRef(null);
  const [allConnectedUsers, setAllConnectedUsers] = useState([]);
  const [callFrom, setCallFrom] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const user = useAuth();
  const [email, setEmail] = useEmail();
  const [nowCallingTo, setNowCallingTo] = useState(null);
  const userVideoRef = useRef(null);
  const myVideoRef = useRef(null);
  const [addedCandidates, setAddedCandidates] = useState([]);

  const basicSetup = async () => {
    const servers = {
      iceServers: [
        {
          urls: [
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
          ],
        },
      ],
      iceCandidatePoolSize: 10,
    };
    webRTC.current = new RTCPeerConnection(servers);

    // setting local stream and remote Stream
    localStremRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    remoteStremRef.current = new MediaStream();

    localStremRef.current.getTracks().forEach((track) => {
      webRTC.current.addTrack(track, localStremRef.current);
    });

    webRTC.current.ontrack = (e) => {
      e.streams[0].getTracks().forEach((track) => {
        remoteStremRef.current.addTrack(track);
      });
    };

    myVideoRef.current.srcObject = localStremRef.current;
    userVideoRef.current.srcObject = remoteStremRef.current;
  };

  useEffect(() => {
    if (!user) return;

    const socket = io("ws://localhost:3000");

    socket.emit("login", { email: user.email });

    socket.on("user-changed", ({ users }) => {
      setAllConnectedUsers(users);
    });

    socket.on("incoming-call", async ({ from, offer, candidates }) => {
      setCallFrom(from);
      await webRTC.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      candidates.forEach((candidate) => {
        const isAdded = addedCandidates.find((cand) => candidate == cand);
        if (!isAdded) {
          const cand = new RTCIceCandidate(candidate);
          webRTC.current.addIceCandidate(cand);
        }
      });
      setAddedCandidates(candidates);
    });

    socket.on("call-rejected", ({ from }) => {
      setCallFrom(null);
      setIsCalling(false);
      basicSetup();
    });

    socket.on("call-accepted", async ({ from, answer }) => {
      setEmail(from);
      setIsCalling(true);
      setNowCallingTo(from);

      if (!webRTC.current.currentRemoteDescription) {
        const answerDescription = new RTCSessionDescription(answer);
        webRTC.current.setRemoteDescription(answerDescription);
      }
      console.log(webRTC.current);
    });

    socket.on("call-ended", ({ from }) => {
      setIsCalling(false);
      setNowCallingTo(null);
      webRTC.current.close();
      basicSetup();
    });

    socket.on("candidate", async ({ from, candidates }) => {
      candidates.forEach((candidate) => {
        const isAdded = addedCandidates.find((cand) => candidate == cand);
        if (!isAdded) {
          const cand = new RTCIceCandidate(candidate);
          webRTC.current.addIceCandidate(cand);
        }
      });
      setAddedCandidates(candidates);
    });

    socket.on("store-Answer", async ({ from, answer }) => {
      // set answer here
    });

    // set socket for later use
    socketRef.current = socket;
  }, []);

  return [
    socketRef,
    allConnectedUsers,
    callFrom,
    setCallFrom,
    isCalling,
    setIsCalling,
    nowCallingTo,
    setNowCallingTo,
    userVideoRef,
    myVideoRef,
  ];
};
