import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AppShell } from '@/features/app/AppShell'
import { PageStub } from '@/features/app/PageStub'
import { AssistantPage } from '@/features/assistant/AssistantPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { EnvironmentsPage } from '@/features/environments/EnvironmentsPage'
import { EnvironmentDetailPage } from '@/features/environments/detail/EnvironmentDetailPage'
import { LandingPage } from '@/features/landing/LandingPage'
import { RepositoriesPage } from '@/features/repositories/RepositoriesPage'
import { RepositoryDetailPage } from '@/features/repositories/detail/RepositoryDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="repositories" element={<RepositoriesPage />} />
          <Route path="repositories/connect" element={<PageStub title="Connect repository" page="06" />} />
          <Route path="repositories/:repoId" element={<RepositoryDetailPage />} />
          <Route path="environments" element={<EnvironmentsPage />} />
          <Route path="environments/:envId" element={<EnvironmentDetailPage />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="team" element={<PageStub title="Team members" page="12" />} />
          <Route path="billing" element={<PageStub title="Billing & usage" page="13" />} />
          <Route path="integrations" element={<PageStub title="Integrations" page="16" />} />
          <Route path="settings" element={<PageStub title="Settings" page="17" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
