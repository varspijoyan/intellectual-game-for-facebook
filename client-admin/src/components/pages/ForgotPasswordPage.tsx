import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/authApi";

type ForgotForm = { email: string };

export default function ForgotPasswordPage() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<ForgotForm>();

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const response = await forgotPassword(values);
      setSubmitSuccess(response.message || "Password reset instructions sent.");
    } catch {
      setSubmitError("Failed to send reset instructions.");
    }
  });

  return (
    <div className="login-wrap">
      <section className="panel login-card">
        <h2>Forgot Password</h2>
        <p>Enter your account email to receive password reset instructions.</p>
        <form onSubmit={onSubmit} autoComplete="off">
          <label>Email</label>
          <input type="email" {...register("email", { required: true })} />
          {submitError ? <p className="error-text">{submitError}</p> : null}
          {submitSuccess ? <p className="success-text">{submitSuccess}</p> : null}
          <button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </section>
    </div>
  );
}
