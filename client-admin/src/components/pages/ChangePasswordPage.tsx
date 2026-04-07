import { useState } from "react";
import { useForm } from "react-hook-form";
import { changePassword } from "../../api/authApi";

type ChangeForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePasswordPage() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<ChangeForm>();

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (values.newPassword !== values.confirmPassword) {
      setSubmitError("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await changePassword(values);
      setSubmitSuccess(response.message || "Password changed successfully.");
    } catch {
      setSubmitError("Failed to change password.");
    }
  });

  return (
    <section className="panel">
      <h2>Change Password</h2>
      <form onSubmit={onSubmit} autoComplete="off">
        <label>Current password</label>
        <input type="password" autoComplete="new-password" {...register("currentPassword", { required: true })} />
        <label>New password</label>
        <input type="password" autoComplete="new-password" {...register("newPassword", { required: true, minLength: 8 })} />
        <label>Confirm new password</label>
        <input type="password" autoComplete="new-password" {...register("confirmPassword", { required: true, minLength: 8 })} />
        {submitError ? <p className="error-text">{submitError}</p> : null}
        {submitSuccess ? <p className="success-text">{submitSuccess}</p> : null}
        <button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? "Updating..." : "Update password"}
        </button>
      </form>
    </section>
  );
}
