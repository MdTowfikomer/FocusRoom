import LandingPage from "../pages/landing";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Authentication from "../pages/Authentication";
import { AuthProvider } from "../contexts/AuthContext";
import VideosMeeting from "../pages/VideosMeeting";
import { ThemeContextProvider } from "../contexts/ThemeContext";
import CssBaseline from "@mui/material/CssBaseline";

function App() {
  return (
    <>
      <ThemeContextProvider>
        <CssBaseline />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/:url" element={<VideosMeeting />} />
          </Routes>
        </AuthProvider>
      </ThemeContextProvider>
    </>
  );
}

export default App;