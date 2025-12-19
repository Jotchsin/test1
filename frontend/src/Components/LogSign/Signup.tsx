import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

interface SignupForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<SignupForm>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      const user = response.data.user;
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(user));

      setLoading(false);
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors?.email?.[0] || err.response?.data?.errors?.name?.[0] || err.response?.data?.message || "Registration failed";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const googleUser: User = {
      id: Date.now(),
      name: "Google User",
      email: "googleuser@gmail.com",
    };

    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(googleUser));

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-teal-200 via-pink-100 to-yellow-100">
      <div className="bg-white/60 backdrop-blur-md shadow-lg rounded-xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center mb-8">SIGN UP</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-600 text-center font-medium">{error}</p>
          )}

          <div>
            <label className="block text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="grow h-px bg-gray-300"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-gray-100 transition"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Sign Up with Google
        </button>

        <p className="text-center mt-6 text-gray-700">
          Already have an account?{" "}
          <Link to="/login" className="font-bold hover:underline">
            Login
          </Link>
        </p>

        <p className="text-center mt-4">
          <Link to="/" className="text-pink-600 hover:underline">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
