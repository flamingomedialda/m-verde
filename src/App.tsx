import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import EcoPoints from "@/pages/EcoPoints";
import Points from "@/pages/Points";
import PointDetail from "@/pages/PointDetail";
import Report from "@/pages/Report";
import History from "@/pages/History";
import Alerts from "@/pages/Alerts";
import Profile from "@/pages/Profile";
import OperatorHome from "@/pages/operator/OperatorHome";
import OperatorDeposit from "@/pages/operator/OperatorDeposit";
import OperatorAlerts from "@/pages/operator/OperatorAlerts";
import OperatorAlertNew from "@/pages/operator/OperatorAlertNew";
import OperatorSummary from "@/pages/operator/OperatorSummary";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminEcoPoints from "@/pages/admin/AdminEcoPoints";
import AdminOperators from "@/pages/admin/AdminOperators";
import AdminDeposits from "@/pages/admin/AdminDeposits";
import AdminReports from "@/pages/admin/AdminReports";
import AdminAlerts from "@/pages/admin/AdminAlerts";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminSettings from "@/pages/admin/AdminSettings";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/eco-points" element={<EcoPoints />} />
      <Route path="/points" element={<Points />} />
      <Route path="/points/:id" element={<PointDetail />} />
      <Route path="/report" element={<Report />} />
      <Route path="/history" element={<History />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/profile" element={<Profile />} />

      <Route path="/operator" element={<OperatorHome />} />
      <Route path="/operator/deposit" element={<OperatorDeposit />} />
      <Route path="/operator/alert" element={<OperatorAlerts />} />
      <Route path="/operator/alert/new" element={<OperatorAlertNew />} />
      <Route path="/operator/summary" element={<OperatorSummary />} />

      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/eco-points" element={<AdminEcoPoints />} />
      <Route path="/admin/operators" element={<AdminOperators />} />
      <Route path="/admin/deposits" element={<AdminDeposits />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/alerts" element={<AdminAlerts />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="/admin/settings" element={<AdminSettings />} />

      <Route path="/index" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
