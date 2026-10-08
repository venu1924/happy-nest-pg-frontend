import { Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Residents from '../pages/Residents';
import PastResidents from '../pages/PastResidents';
import ResidentDetails from '../pages/ResidentDetails';
import AddResident from '../pages/AddResident';
import EditResident from '../pages/EditResident';
import Rooms from '../pages/Rooms';
import FloorView from '../pages/FloorView';
import RoomDetails from '../pages/RoomDetails';
import TransferResident from '../pages/TransferResident';
import Transfers from '../pages/Transfers';
import Payments from '../pages/Payments';
import Profile from '../pages/Profile';

function ProtectedApp() {
  return (
    <ProtectedRoute>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedApp />}>
        <Route index element={<Dashboard />} />
        <Route path="residents" element={<Residents />} />
        <Route path="residents/new" element={<AddResident />} />
        <Route path="residents/past" element={<PastResidents />} />
        <Route path="residents/:id" element={<ResidentDetails />} />
        <Route path="residents/:id/edit" element={<EditResident />} />
        <Route path="residents/:id/transfer" element={<TransferResident />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="rooms/floor/:floorNumber" element={<FloorView />} />
        <Route path="rooms/:roomNumber" element={<RoomDetails />} />
        <Route path="transfers" element={<Transfers />} />
        <Route path="payments" element={<Payments />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
