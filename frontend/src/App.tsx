import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from '@/components/RequireAuth';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import {
  ClientDetail,
  Clients,
  Dashboard,
  Login,
  NotFound,
  ProjectDetail,
  Projects,
  SharedProject,
} from '@/pages';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="/share/:token" element={<SharedProject />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
