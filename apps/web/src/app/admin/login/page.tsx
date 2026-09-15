import { StaffLoginForm } from "@/components/staff-login-form";

export default function AdminLoginPage() {
  return <StaffLoginForm title="Bite Corner — Admin Login" redirectTo="/admin" role="ADMIN" />;
}
