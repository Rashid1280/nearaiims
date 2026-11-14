import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

// Shared login/signup form. Used standalone on /login and /register,
// and inline when a logged-out user tries to book a property.
function AuthForm({ mode, onSuccess, onSwitchMode, compact = false }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { setUser } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "register") {
        await api.post("/api/auth/register", {
          name,
          email,
          password,
          phone,
        });
      }
      // login mode, or right after a successful registration
      const response = await api.post("/api/auth/login", { email, password });
      setUser(response.data.user);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const form = (
    <form
      onSubmit={handleSubmit}
      className={
        compact
          ? "flex flex-col gap-3"
          : "mt-8 border border-line rounded-lg p-6 flex flex-col gap-3"
      }
    >
      {mode === "register" && (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="w-full border border-line rounded-md px-3 py-2 text-sm"
        />
      )}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="w-full border border-line rounded-md px-3 py-2 text-sm"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="w-full border border-line rounded-md px-3 py-2 text-sm"
      />
      {mode === "register" && (
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          required
          className="w-full border border-line rounded-md px-3 py-2 text-sm"
        />
      )}

      {error && <p className="text-danger text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-5 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60"
      >
        {submitting
          ? "Please wait..."
          : mode === "register"
            ? "Sign up"
            : "Log in"}
      </button>

      {onSwitchMode && (
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-sm text-brand underline text-center"
        >
          {mode === "register"
            ? "Already have an account? Log in"
            : "New here? Sign up"}
        </button>
      )}
    </form>
  );

  if (compact) return form;

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink text-center">
        {mode === "register" ? "Register" : "Login"}
      </h1>
      {form}
    </div>
  );
}

export default AuthForm;
