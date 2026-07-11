import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import EcoPoints from "@/pages/EcoPoints";
import Points from "@/pages/Points";
import PointDetail from "@/pages/PointDetail";
import Report from "@/pages/Report";
import History from "@/pages/History";
import Alerts from "@/pages/Alerts";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
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
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/register" element={<Register />} />

      <Route path="/home" element={<ProtectedRoute allow={["citizen"]}><Home /></ProtectedRoute>} />
      <Route path="/eco-points" element={<ProtectedRoute><EcoPoints /></ProtectedRoute>} />
      <Route path="/points" element={<ProtectedRoute allow={["citizen"]}><Points /></ProtectedRoute>} />
      <Route path="/points/:id" element={<ProtectedRoute allow={["citizen"]}><PointDetail /></ProtectedRoute>} />
      <Route path="/report" element={<ProtectedRoute allow={["citizen"]}><Report /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute allow={["citizen"]}><History /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

      <Route path="/operator" element={<ProtectedRoute allow={["operator"]}><OperatorHome /></ProtectedRoute>} />
      <Route path="/operator/deposit" element={<ProtectedRoute allow={["operator"]}><OperatorDeposit /></ProtectedRoute>} />
      <Route path="/operator/alert" element={<ProtectedRoute allow={["operator"]}><OperatorAlerts /></ProtectedRoute>} />
      <Route path="/operator/alert/new" element={<ProtectedRoute allow={["operator"]}><OperatorAlertNew /></ProtectedRoute>} />
      <Route path="/operator/summary" element={<ProtectedRoute allow={["operator"]}><OperatorSummary /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute allow={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/eco-points" element={<ProtectedRoute allow={["admin"]}><AdminEcoPoints /></ProtectedRoute>} />
      <Route path="/admin/operators" element={<ProtectedRoute allow={["admin"]}><AdminOperators /></ProtectedRoute>} />
      <Route path="/admin/deposits" element={<ProtectedRoute allow={["admin"]}><AdminDeposits /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allow={["admin"]}><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/alerts" element={<ProtectedRoute allow={["admin"]}><AdminAlerts /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute allow={["admin"]}><AdminAnalytics /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allow={["admin"]}><AdminSettings /></ProtectedRoute>} />

      <Route path="/index" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
