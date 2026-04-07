import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/authApi";
import { useAppDispatch } from "../../redux/hooks";
import { loginSuccess } from "../../redux/slices/authSlice";

type LoginForm = { email: string; password: string };

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<LoginForm>();

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const session = await login(values);
      dispatch(loginSuccess(session));
      navigate("/", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      setSubmitError(message);
    }
  });

  return (
    <div className="login-wrap">
      <section className="panel login-card">
        <h2>Admin Login</h2>
        <form onSubmit={onSubmit} autoComplete="off">
          <label>Email</label>
          <input
            type="email"
            {...register("email", {
              required: true,
              validate: (value) => value.includes("@") || "Email must contain @",
            })}
          />
          {formState.errors.email?.message ? (
            <p className="error-text">{formState.errors.email.message}</p>
          ) : null}
          <label>Password</label>
          <input
            type="password"
            autoComplete="new-password"
            defaultValue=""
            {...register("password", { required: true })}
          />
          {submitError ? <p className="error-text">{submitError}</p> : null}
          <div className="auth-links auth-links-right">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}
