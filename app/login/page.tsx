import SignupPage from "../signup/page";

// /login is the same phone+OTP flow as /signup — it toggles to login mode
// by default via the component's internal state. Kept as a separate route
// since "Login" is what people expect to click from the header.
export default function LoginPage() {
  return <SignupPage initialMode="LOGIN" />;
}
