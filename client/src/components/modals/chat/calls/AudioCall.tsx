import React, { useEffect, useRef, useState } from "react";
import "../css/audio-call.css";
import { Socket } from "socket.io-client";
import {
  CallEnd as CallEndIcon,
  Mic as MicIcon,
  VolumeUp as VolumeUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import no_profile_photo from "../../../../assets/no-profile-photo.png";

interface AudioCallModalProps {
  socket: Socket;
  remoteUserId: string;
  isInitiator: boolean;
  onClose: () => void;
}

const AudioCallModal: React.FC<AudioCallModalProps> = ({
  socket,
  remoteUserId,
  isInitiator,
  onClose,
}) => {
  const [callStarted, setCallStarted] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    socket?.on("incomingCall", handleIncomingCall);
    socket?.on("offer", handleOffer);
    socket?.on("answer", handleAnswer);
    socket?.on("iceCandidate", handleIceCandidate);
    socket?.on("callEnded", handleCallEnded);

    return () => {
      socket?.off("incomingCall", handleIncomingCall);
      socket?.off("offer", handleOffer);
      socket?.off("answer", handleAnswer);
      socket?.off("iceCandidate", handleIceCandidate);
      socket?.off("callEnded", handleCallEnded);
    };
  }, []);

  useEffect(() => {
    if (isInitiator) {
      startCall(true, remoteUserId);
    }
  }, [isInitiator, remoteUserId]);

  const handleIncomingCall = (data: { from: string }) => {
    console.log(data);
    if (!callStarted) {
      startCall(false, data.from);
    }
  };

  const handleOffer = async (data: {
    offer: RTCSessionDescriptionInit;
    from: string;
  }) => {
    if (!pcRef.current) {
      await startCall(false, data.from);
    }
    if (pcRef.current) {
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socket?.emit("answer", { answer, toUserId: data.from });
    }
  };

  const handleAnswer = async (data: {
    answer: RTCSessionDescriptionInit;
    from: string;
  }) => {
    if (pcRef.current && pcRef.current.signalingState === "have-local-offer") {
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    } else {
      console.warn(
        "Remote answer received in invalid state:",
        pcRef.current?.signalingState
      );
    }
  };

  const handleIceCandidate = async (data: {
    candidate: RTCIceCandidateInit;
    from: string;
  }) => {
    if (pcRef.current) {
      try {
        await pcRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    }
  };

  const handleCallEnded = () => {
    endCall();
  };

  const startCall = async (initiator: boolean, targetUserId: string) => {
    try {
      // Mikrofon axını alınır
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      localStreamRef.current = localStream;

      // PeerConnection yaradılır (STUN server konfiqurasiya olunur)
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      // Lokal axın track-ləri əlavə edilir
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      // ICE candidate-lər tapıldıqda backend-ə göndərilir
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("iceCandidate", {
            candidate: event.candidate,
            toUserId: targetUserId,
          });
        }
      };

      // Uzaq tərəfdən gələn axın audio elementinə yönləndirilir
      pc.ontrack = (event) => {
        const remoteAudio = document.getElementById(
          "remoteAudio"
        ) as HTMLAudioElement;
        if (remoteAudio) {
          remoteAudio.srcObject = event.streams[0];
          remoteAudio.play();
        }
      };

      if (initiator) {
        // Əgər zəngi başlatan tərəfdirsə, offer yaradılır və göndərilir
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket?.emit("offer", { offer, toUserId: targetUserId });
      }

      setCallStarted(true);
    } catch (err) {
      console.error("Error starting call:", err);
    }
  };

  const endCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    socket?.emit("endCall", { toUserId: remoteUserId });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.9)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div style={{ color: "white" }}>
        {/*Name And Image Section*/}
        <div className="flex flex-col gap-5 items-center">
          <h1 className="text-2xl absolute top-24">John Doe | @johndoe</h1>
          <h5 className="text-md absolute top-40">Call Duration: 00:00</h5>
        </div>
        <img
          src={no_profile_photo}
          alt=""
          width={200}
          height={150}
          className="mb-12"
        />

        {/*Audio Section*/}
        <audio id="remoteAudio" autoPlay style={{ display: "none" }} />

        {/*Audio Call Control Section*/}
        <div className="flex gap-3 justify-center absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-[var(--audio-call-bg-color)] py-5 px-8 rounded-md">
          <button
            style={{
              padding: "12px 18px",
              fontSize: "16px",
            }}
            className="call-buttons bg-[var(--primary-color)] opacity-80 text-white rounded-md hover:opacity-100 transition-all duration-300 ease-in-out"
          >
            <KeyboardArrowDownIcon />
          </button>
          <button
            style={{
              padding: "12px 18px",
              fontSize: "16px",
            }}
            className="call-buttons bg-[var(--primary-color)] opacity-80 text-white rounded-md hover:opacity-100 transition-all duration-300 ease-in-out"
          >
            <VolumeUpIcon />
          </button>
          <button
            style={{
              padding: "12px 18px",
              fontSize: "16px",
            }}
            className="call-buttons bg-[var(--primary-color)] opacity-80 text-white rounded-md hover:opacity-100 transition-all duration-300 ease-in-out"
          >
            <MicIcon />
          </button>
          <button
            onClick={endCall}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
            }}
            className="bg-red-500 text-white rounded-md hover:bg-[red] transition-colors duration-300 ease-in-out"
          >
            <CallEndIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioCallModal;
