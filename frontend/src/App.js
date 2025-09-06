import axios from "axios";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import NotFound from "./companents/NotFound";
import Course from "./pages/Course";
import Facultets from "./pages/Facultets";
import Group from "./pages/Group";
import Home from "./pages/Home";
import Pages from "./pages/Pages";
import Rooms from "./pages/Rooms";
import Schedule from "./pages/Schedule";
import { useEffect, useRef } from "react";
axios.defaults.baseURL = "http://localhost:3003/api";
// axios.defaults.baseURL = "https://apidata.samdu.uz/api/";

function App() {

  const location = useLocation()

  return (
    <Routes>
      <Route path="/" element={<Outlet />}>
        <Route path="rooms" element={<Rooms />} />
        <Route index element={<Home />} />
        <Route path="schedule" element={<Pages location={location} />}>
          <Route index element={<Facultets />} />
          <Route path=":facultyId" element={<Outlet />}>
            <Route index element={<Course />} />
            <Route path=":year/:semester" element={<Outlet />}>
              <Route index element={<Group />} />
              <Route path=":groupId">
                <Route index element={<Schedule />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
