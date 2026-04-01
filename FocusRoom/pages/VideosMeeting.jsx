import React, { useEffect, useRef, useState } from 'react';
import "../styles/VideosMeeting.css";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { io } from "socket.io-client";


const server_url = "http://localhost:8000"; //Signaling Server URL

// Stores RTCPeerConnection objects for each remote user
let connections = {};

// WebRTC configuration including STUN servers to bypass NAT/Firewalls
const peerConnectionConfig = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302" // Google's public STUN server to find public IPs
    }
  ]
}

export default function VideosMeeting() {
  // References for the socket and the local video element
  let socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();

  // State to track hardware status and available media
  let [videoAvaliable, setVideoAvaliable] = useState(true);
  let [audioAvaliable, setAudioAvaliable] = useState(true);

  let [videoEnabled, setVideoEnabled] = useState(true);
  let [audio, setAudio] = useState(true);
  let [screen, setScreen] = useState();

  let [showModel, setShowModel] = useState();
  let [screenAvailable, setScreenAvailable] = useState(false);

  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");

  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");

  const videoRef = useRef([]); // TODO: UNDERSTAND THIS
  let [videos, setVideos] = useState([]);

  /**
   * Requests initial media permissions from the user.
   * This is typically called on mount to show the local preview in the lobby.
   */
  const getPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      setVideoAvaliable(!!videoTrack);
      setAudioAvaliable(!!audioTrack);

      if (videoAvaliable || audioAvaliable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvaliable, audio: audioAvaliable });
        localVideoRef.current.srcObject = userMediaStream;
      }

    } catch (error) {
      console.log(error);

    }
  }

  useEffect(() => {
    getPermission();
  }, [])

  let getUserPermissionSuccess = (stream) => {
    // Logic for successful stream acquisition would go here
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      console.log(err);
    }
    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    for (let id in connections) {
      if (id === socketIdRef.current) {
        continue;
      }
      window.localStream.getTracks().forEach((track) => {
        connections[id].addTrack(track, window.localStream);
      });

      connections[id].createOffer()
        .then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({ 'sdp': connections[id].localDescription }));
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    }

    stream.getTracks().forEach(track => track.onended = () => {
      setVideoEnabled(false);
      setAudio(false);

      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (err) {
        console.log(err);
      }

      //TODO: BLACKSLIENCE
      let blackSilence = (...args) => {
        const videoTrack = black(...args);
        const audioTrack = silence();
        return new MediaStream([videoTrack, audioTrack]);
      }
      window.localStream = blackSilence();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = window.localStream;
      }

      for (id in connections) {
        window.localStream.getTracks().forEach((track) => {
          connections[id].addTrack(track, window.localStream);
        });

        connections[id].createOffer()
          .then((description) => {
            connections[id].setLocalDescription(description)
              .then(() => {
                socketRef.current.emit("signal", id, JSON.stringify({ 'sdp': connections[id].localDescription }));
              })
              .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
      }
    })
  }

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = ctx.createMediaStreamDestination();

    oscillator.connect(dst);
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  }

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement('canvas'), { width, height });
    let ctx = canvas.getContext('2d');
    ctx.fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  }


  /**
   * Toggles media tracks based on state changes.
   * Ensures tracks are stopped if the user disables video/audio.
   */
  let getUserMediaPermission = async () => {
    try {
      if ((videoEnabled && videoAvaliable) || (audio && audioAvaliable)) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: videoAvaliable, audio: audioAvaliable });
        getUserPermissionSuccess(stream);
      } else {
        // Stop all active tracks to turn off the camera/mic hardware
        let track = localVideoRef.current.srcObject.getTracks();
        track.forEach(track => {
          track.stop();
        })
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (videoEnabled !== undefined && audio !== undefined) {
      getUserMediaPermission();
    }
  }, [videoEnabled, audio])

  let addMessage = () => {
    // Implementation for adding chat messages to state
  }

  let gotMessageFromServer = (fromId, message) => {
    // Signaling handler for incoming ICE candidates and SDP offers/answers
    let signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId].createAnswer()
                .then((description) => {
                  connections[fromId].setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit("signal", fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                    })
                }).catch(err => console.log(err));
            }
          })
          .catch(err => console.log(err));
      }
      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(err => console.log(err));
      }
    }
  }

  /**
   * Establishes connection to the signaling server and sets up WebRTC peer logic.
   */
  let connectToSocketServer = () => {
    if (!socketRef.current) {
      socketRef.current = io(server_url);
    }

    // Listen for WebRTC signaling messages (SDP/ICE)
    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on("connect", () => {
      // Notify the server we are joining the call
      socketRef.current.emit('join-call', window.location.href); // join specific room (based on URL)

      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      // Cleanup connections when a user leaves
      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter(v => v.socketId !== id));
      });

      /**
       * Triggered when a new user joins the room.
       * We initiate a peer connection for every other client in the list.
       */
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketIdList) => {
          // 1. Create a P2P connection for every peer
          connections[socketIdList] = new RTCPeerConnection(peerConnectionConfig);

          // 2. Send local ICE candidates to the remote peer via the signaling server
          connections[socketIdList].onicecandidate = (event) => {
            if (event.candidate) {
              socketRef.current.emit("signal", socketIdList, JSON.stringify({ 'ice': event.candidate }));
            }
          }

          // 3. Handle incoming media streams from the remote peer
          connections[socketIdList].ontrack = (event) => {
            if (event.track.kind !== 'video') return;
            const remoteStream = event.streams[0];

            let videoExist = videoRef.current.find((video) => video.socketId === socketIdList);

            if (videoExist) {
              // Update existing stream
              setVideos((videos) => {
                const updatedVideos = videos.map(video => {
                  return video.socketId === socketIdList ? { ...video, stream: remoteStream } : video;
                });
                videoRef.current = updatedVideos;
                return updatedVideos;
              })
            } else {
              // Add new stream to state for rendering
              let newVideo = {
                socketId: socketIdList,
                stream: remoteStream,
                autoPlay: true,
                playsinline: true,
              }
              setVideos((videos) => {
                const updatedVideo = [...videos, newVideo];
                videoRef.current = updatedVideo;
                return updatedVideo;
              });
            }
          }

          // 4. Attach our local camera stream to the P2P connection
          if (window.localStream !== undefined && window.localStream !== null) {
            window.localStream.getTracks().forEach((track) => {
              connections[socketIdList].addTrack(track, window.localStream);
            })
          } else {
            // TODO: BLACKSILENCE
            let blackSilence = (...args) => {
              const videoTrack = black(...args);
              const audioTrack = silence();
              return new MediaStream([videoTrack, audioTrack]);
            }
            window.localStream = blackSilence();
            window.localStream.getTracks().forEach((track) => {
              connections[socketIdList].addTrack(track, window.localStream);
            })
          }

        })

        // 5. If I am the one who just joined, send an 'Offer' to everyone else 
        // TODO: what does Offer means here..?
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              window.localStream.getTracks().forEach((track) => {
                connections[id2].addTrack(track, window.localStream);
              })
            } catch (err) {
              console.log(err);
            }
            connections[id2].createOffer()
              .then((description) => {
                connections[id2].setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription })) // session description
                  })
                  .catch(e => console.log(e))
              })
              .catch(e => console.log(e))
          }
        }
      });
    })
  }

  /**
   * Initializes media and starts the socket connection process.
   */
  let getMedia = () => {
    setVideoEnabled(videoAvaliable);
    setAudio(audioAvaliable);
    connectToSocketServer();
  }

  /**
   * Moves the user from the lobby into the actual meeting.
   */
  let connect = () => {
    setAskForUsername(false);
    getMedia();
  }

  return (
    <div className='meetingContainer'>
      {askForUsername === true ?
        <div>
          <h2>Enter into the Lobby</h2> <br />
          <TextField id="outlined-basic" label="Username" variant="outlined" value={username} onChange={e => setUsername(e.target.value)} /> <br /> <br />
          <Button variant="contained" onClick={connect}>Join</Button>

          <div>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div> : <>
          {/* Main Meeting UI would be rendered here */}
          <video
            ref={(ref) => {
              if (ref && window.localStream) {
                ref.srcObject = window.localStream;
              }
            }}
            autoPlay
            muted></video>

          {videos.map((video) => (
            <div key={video.socketId} className="video-container">
              <h2>{video.socketId}</h2>
              <video
                data-socket={video.socketId}
                ref={ref => {
                  if (ref && video.stream) {
                    ref.srcObject = video.stream;
                  }
                }}
                autoPlay
              ></video>
            </div>
          ))}
        </>
      }
    </div>
  )
}

