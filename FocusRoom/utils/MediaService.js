/**
 * MediaService handles all hardware interactions (Camera, Mic, Screen Share).
 */
class MediaService {
    static async getCameraStream() {
        try {
            return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (error) {
            console.error("Error accessing camera:", error);
            throw error;
        }
    }

    static async getDisplayStream() {
        try {
            return await navigator.mediaDevices.getDisplayMedia({ video: true });
        } catch (error) {
            console.error("Error accessing screen share:", error);
            throw error;
        }
    }

    static stopStream(stream) {
        if (!stream) return;
        stream.getTracks().forEach(track => {
            track.enabled = false;
            track.stop();
        });
    }

    static toggleTrack(stream, kind, enabled) {
        if (!stream) return;
        const tracks = kind === 'video' ? stream.getVideoTracks() : stream.getAudioTracks();
        tracks.forEach(track => {
            track.enabled = enabled;
        });
    }
}

export { MediaService };
