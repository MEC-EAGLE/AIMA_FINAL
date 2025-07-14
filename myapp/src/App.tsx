import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Verify from './components/Verify';
import Dashboard from './components/Dashboard';
import Create from './components/Create';
import Community from './components/Community';
import Search from './components/Search';
import Chat from './components/Chat';
import Jobs from './components/Jobs';
import Profile from './components/Profile';
import Calendar from './components/Calendar';
import Notes from './components/Notes';
import PeopleMap from './components/PeopleMap';
import Interview from './components/Interview';
import Forgot from './components/Forgot';
import Settings from './components/Settings';
import Apply from './components/Apply';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<Create />} />
        <Route path="/community" element={<Community />} />
        <Route path="/search" element={<Search />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/chat/:email" element={<Chat />} />
        <Route path="/profile/:email" element={<Profile />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/people-map" element={<PeopleMap />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/apply/:id" element={<Apply />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
export default App;
