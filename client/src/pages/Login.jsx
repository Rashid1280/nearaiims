import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";

function Login() {
  const navigate = useNavigate();

  return <AuthForm mode="login" onSuccess={() => navigate("/")} />;
}

export default Login;
