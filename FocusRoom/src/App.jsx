import LandingPage from "../pages/landing";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Authentication from "../pages/Authentication";
import { AuthProvider } from "../contexts/AuthContext";
import VideosMeeting from "../pages/VideosMeeting";

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/:url" element={<VideosMeeting />} />
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;