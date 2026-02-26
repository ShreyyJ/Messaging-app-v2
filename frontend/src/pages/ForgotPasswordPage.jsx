import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, MessageSquare } from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";
import { useAuthStore } from "../store/useAuthStore";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { requestPasswordReset, isRequestingReset } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await requestPasswordReset(email);
    setSubmitted(true);
    if (ok) {
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 600);
    }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Forgot Password</h1>
              <p className="text-base-content/60">We will send an OTP if the email exists</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isRequestingReset}>
              {isRequestingReset ? "Sending..." : "Send OTP"}
            </button>
          </form>

          {submitted && (
            <p className="text-center text-base-content/60">
              If the email exists, an OTP was sent. Check server logs for now.
            </p>
          )}

          <div className="text-center">
            <Link to="/login" className="link link-primary">Back to login</Link>
          </div>
        </div>
      </div>

      <AuthImagePattern
        title="Reset your password"
        subtitle="Enter your email to receive a one-time password."
      />
    </div>
  );
};

export default ForgotPasswordPage;
