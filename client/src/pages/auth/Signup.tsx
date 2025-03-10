import { useState } from "react";
import "./css/signup.css";
import ConfirmAccount from "../../components/forms/ConfirmAccount";
import { signup } from "../../services/auth/auth-service";
import { Gender, SignupDTO } from "../../services/auth/dto/singup-dto";
import SignupForm from "../../components/forms/SignupForm";
import CheckModal from "../../components/modals/spinner/CheckModal";
import SuccessMessage from "../../components/messages/SuccessMessage";
import ErrorMessage from "../../components/messages/ErrorMessage";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);

      const signupDTO: SignupDTO = {
        ...formData,
        gender: formData.gender as Gender,
      };

      const response = await signup(signupDTO);

      if (response.success) {
        setShowConfirmForm(true);
        setSuccessMessage(
          "Confirm code has been sent to your email. Please check your inbox."
        );
      } else {
        setIsLoading(false);
        if (Array.isArray(response.message)) {
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

      setIsLoading(false);
    } else {
      setErrorMessage("Please fill all the fields");
      setIsLoading(false);
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
          <ErrorMessage
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        )}

        {successMessage && (
          <SuccessMessage
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}

        {/* Modal to show "Checking" */}
        {isLoading && <CheckModal message={"Checking..."} />}

        {!showConfirmForm ? (
          <>
            <SignupForm
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
            />
          </>
        ) : (
          <ConfirmAccount />
        )}
      </section>
    </main>
  );
};

export default Signup;
