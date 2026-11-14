import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";

function Register() {
  const navigate = useNavigate();

  return <AuthForm mode="register" onSuccess={() => navigate("/")} />;
}

export default Register;
