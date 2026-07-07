import { Suspense } from "react";
import StaffLoginForm from "@/components/StaffLoginForm";

export default function StaffLoginPage() {
  return (
    <Suspense fallback={null}>
      <StaffLoginForm />
    </Suspense>
  );
}
