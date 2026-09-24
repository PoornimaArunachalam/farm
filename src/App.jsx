import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";

// Guards
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/admin/AdminLogin";
import FarmerLogin from "./pages/farmer/FarmerLogin";
import CompanyLogin from "./pages/company/CompanyLogin";

// Farmer Pages
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import FarmerProfile from "./pages/farmer/FarmerProfile";
import MyCrops from "./pages/farmer/MyCrops";
import AddCrop from "./pages/farmer/AddCrop";
import EditCrop from "./pages/farmer/EditCrop";
import CropDetails from "./pages/farmer/CropDetails";
import CompanyDemands from "./pages/farmer/CompanyDemands";
import FindCompanies from "./pages/farmer/FindCompanies";
import CompanyDetails from "./pages/farmer/CompanyDetails";
import FarmerMessages from "./pages/farmer/FarmerMessages";
import FarmerDeals from "./pages/farmer/FarmerDeals";
import FarmerNotifications from "./pages/farmer/FarmerNotifications";

// Company Pages
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyProfile from "./pages/company/CompanyProfile";
import MyDemands from "./pages/company/MyDemands";
import AddDemand from "./pages/company/AddDemand";
import EditDemand from "./pages/company/EditDemand";
import DemandDetails from "./pages/company/DemandDetails";
import AvailableCrops from "./pages/company/AvailableCrops";
import FindFarmers from "./pages/company/FindFarmers";
import FarmerDetails from "./pages/company/FarmerDetails";
import CompanyMessages from "./pages/company/CompanyMessages";
import CompanyDeals from "./pages/company/CompanyDeals";
import CompanyNotifications from "./pages/company/CompanyNotifications";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageFarmers from "./pages/admin/ManageFarmers";
import ManageCompanies from "./pages/admin/ManageCompanies";
import ManageCrops from "./pages/admin/ManageCrops";
import ManageDemands from "./pages/admin/ManageDemands";
import ManageDeals from "./pages/admin/ManageDeals";
import Reports from "./pages/admin/Reports";

export default function App() {
  return (
    <Routes>
      {/* Public Landing */}
      <Route path="/" element={<Home />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/farmer/login" element={<FarmerLogin />} />
        <Route path="/company/login" element={<CompanyLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Workspaces */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Farmer Routes */}
          <Route element={<RoleGuard allowedRoles={["farmer", "admin"]} />}>
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/farmer/my-crops" element={<MyCrops />} />
            <Route path="/farmer/add-crop" element={<AddCrop />} />
            <Route path="/farmer/edit-crop/:cropId" element={<EditCrop />} />
            <Route path="/farmer/crops/:cropId" element={<CropDetails />} />
            <Route path="/farmer/demands" element={<CompanyDemands />} />
            <Route path="/farmer/companies" element={<FindCompanies />} />
            <Route path="/farmer/companies/:companyId" element={<CompanyDetails />} />
            <Route path="/farmer/messages" element={<FarmerMessages />} />
            <Route path="/farmer/deals" element={<FarmerDeals />} />
            <Route path="/farmer/notifications" element={<FarmerNotifications />} />
            <Route path="/farmer/profile" element={<FarmerProfile />} />
          </Route>

          {/* Company Routes */}
          <Route element={<RoleGuard allowedRoles={["company", "admin"]} />}>
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/company/my-demands" element={<MyDemands />} />
            <Route path="/company/add-demand" element={<AddDemand />} />
            <Route path="/company/edit-demand/:demandId" element={<EditDemand />} />
            <Route path="/company/demands/:demandId" element={<DemandDetails />} />
            <Route path="/company/farmers" element={<AvailableCrops />} />
            <Route path="/company/find-farmers" element={<FindFarmers />} />
            <Route path="/company/farmers/:farmerId" element={<FarmerDetails />} />
            <Route path="/company/messages" element={<CompanyMessages />} />
            <Route path="/company/deals" element={<CompanyDeals />} />
            <Route path="/company/notifications" element={<CompanyNotifications />} />
            <Route path="/company/profile" element={<CompanyProfile />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<RoleGuard allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/farmers" element={<ManageFarmers />} />
            <Route path="/admin/companies" element={<ManageCompanies />} />
            <Route path="/admin/crops" element={<ManageCrops />} />
            <Route path="/admin/demands" element={<ManageDemands />} />
            <Route path="/admin/deals" element={<ManageDeals />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
