/**
 * PeerManager handles the WebRTC state machine for multiple peers.
 * It is signaling-agnostic and relies on callbacks for network/UI updates.
 */
class PeerManager {
    constructor(iceServers) {
        this.iceServers = iceServers;
        this.connections = {}; // { [id]: { pc, isPolite, makingOffer, ignoreOffer, iceQueue } }
        
        // Callbacks to be set by the consumer
        this.onSignal = (id, data) => {};
        this.onStream = (id, stream) => {};
        this.onRemoveStream = (id) => {};
    }

    addPeer(id, isPolite, localStream) {
        if (this.connections[id]) return;

        const pc = new RTCPeerConnection({ iceServers: this.iceServers });
        
        this.connections[id] = {
            pc,
            isPolite,
            makingOffer: false,
            ignoreOffer: false,
            iceQueue: []
        };

        // Attach local tracks
        if (localStream) {
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        }

        pc.onicecandidate = ({ candidate }) => {
            if (candidate) {
                this.onSignal(id, JSON.stringify({ iceCandidate: candidate }));
            }
        };

        pc.ontrack = ({ streams }) => {
            this.onStream(id, streams[0]);
        };

        pc.onnegotiationneeded = async () => {
            try {
                const conn = this.connections[id];
                conn.makingOffer = true;
                await pc.setLocalDescription();
                this.onSignal(id, JSON.stringify({ sdp: pc.localDescription }));
            } catch (err) {
                console.error(`Negotiation error for ${id}:`, err);
            } finally {
                const conn = this.connections[id];
                if (conn) conn.makingOffer = false;
            }
        };

        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === "failed") pc.restartIce();
        };
    }

    async handleSignal(id, data) {
        const conn = this.connections[id];
        if (!conn) return;

        const { pc, isPolite } = conn;
        const signal = JSON.parse(data);

        try {
            if (signal.sdp) {
                const offerCollision = signal.sdp.type === "offer" && 
                    (conn.makingOffer || pc.signalingState !== "stable");

                conn.ignoreOffer = !isPolite && offerCollision;
                if (conn.ignoreOffer) return;

                if (offerCollision) {
                    await Promise.all([
                        pc.setLocalDescription({ type: "rollback" }),
                        pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    ]);
                } else {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                }

                if (signal.sdp.type === "offer") {
                    await pc.setLocalDescription();
                    this.onSignal(id, JSON.stringify({ sdp: pc.localDescription }));
                }

                // Flush ICE queue
                for (const candidate of conn.iceQueue) {
                    await pc.addIceCandidate(candidate);
                }
                conn.iceQueue = [];

            } else if (signal.iceCandidate) {
                const candidate = new RTCIceCandidate(signal.iceCandidate);
                if (pc.remoteDescription) {
                    await pc.addIceCandidate(candidate);
                } else {
                    conn.iceQueue.push(candidate);
                }
            }
        } catch (err) {
            console.error(`Signal handling error for ${id}:`, err);
        }
    }

    replaceLocalTracks(newStream) {
        Object.values(this.connections).forEach(({ pc }) => {
            const senders = pc.getSenders();
            newStream.getTracks().forEach(newTrack => {
                const sender = senders.find(s => s.track?.kind === newTrack.kind);
                if (sender) sender.replaceTrack(newTrack);
            });
        });
    }

    removePeer(id) {
        if (this.connections[id]) {
            this.connections[id].pc.close();
            delete this.connections[id];
            this.onRemoveStream(id);
        }
    }

    closeAll() {
        Object.keys(this.connections).forEach(id => this.removePeer(id));
    }
}

export { PeerManager };
