import { useState } from "react";
import "./signup.css";
import ConfirmAccount from "../../components/forms/ConfirmAccount";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { signup } from "../../services/auth/auth-service";
import { Gender, SignupDTO } from "../../services/auth/dto/singup-dto";
import SignupForm from "../../components/forms/SignupForm"; // Import the SignupForm component
import CheckModal from "../../components/modals/CheckModal";

const Signup = () => {
  const [showConfirmForm, setShowConfirmForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    gender: "",
    password: "",
    confirm: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for error message
  const [isLoading, setIsLoading] = useState(false); // State to manage loading state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isFormComplete = Object.values(formData).every(
      (value) => value.trim() !== ""
    );

    if (!formData.gender) {
      setErrorMessage("Please select your gender");
      return;
    }

    if (isFormComplete) {
      setIsLoading(true); // Show the loading modal

      const signupDTO: SignupDTO = {
        ...formData,
        gender: formData.gender as Gender,
      };

      const response = await signup(signupDTO);

      if (response.success) {
        setShowConfirmForm(true);
      } else {
        if (Array.isArray(response.message)) {
          console.log(response.message[0]);
          setErrorMessage(response.message[0]);
        }
        setErrorMessage(
          response.response.message ??
            response.response.error ??
            response.message ??
            response.error ??
            "An error occurred"
        );
      }

      setIsLoading(false); // Hide the loading modal
    } else {
      setErrorMessage("Please fill all the fields");
    }
  };

  return (
    <main id="auth-main">
      <section id="signup">
        <div className="logo">
          <h1>
            Welcome to <span className="text-[#00ff00]">Connectify</span>
          </h1>
        </div>

        {/* Conditionally render the error message */}
        {errorMessage && (
          <Stack sx={{ width: "30%" }} spacing={2} className="error-message">
            <Alert variant="filled" severity="error">
              {errorMessage}
            </Alert>
          </Stack>
        )}

        {/* Modal to show "Checking" */}
        {isLoading && (
          <CheckModal />
        )}

        {!showConfirmForm ? (
          <>
            <SignupForm
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
            />
          </>
        ) : (
          <ConfirmAccount
            handleConfirmationSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              <Stack sx={{ width: "100%" }} spacing={2}>
                <Alert variant="filled" severity="success">
                  Account confirmed successfully
                </Alert>
              </Stack>;
            }}
          />
        )}
      </section>
    </main>
  );
};

export default Signup;
