import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
} from "@mui/material";
import { MyLocation as MyLocationIcon } from "@mui/icons-material";
import ErrorMessage from "../../messages/ErrorMessage";

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  fields: {
    label: string;
    value: string;
    key: string;
    type?: string;
    options?: { value: string; label: string }[];
  }[];
  title: string;
  onSubmit: (data: { [key: string]: string }) => void;
  allowEmpty?: boolean;
  isLocation?: boolean;
}

const ProfileEditModal = ({
  open,
  onClose,
  fields,
  title,
  onSubmit,
  allowEmpty = false,
}: ProfileEditModalProps) => {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>("");

  useEffect(() => {
    const initialData: { [key: string]: string } = {};
    fields.forEach((field) => {
      initialData[field.key] = field.value || "";
    });
    setFormData(initialData);
  }, [fields, open]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const findLocation = async () => {
    // Permissions API ilə əvvəlcədən yoxlayırıq
    try {
      const permissionStatus = await navigator.permissions.query({
        name: "geolocation",
      });

      if (permissionStatus.state === "denied") {
        setErrorMessage(
          "Location is not allowed. Please allow it in your browser settings."
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();

            const location = `${
              data.address.country ? data.address.country : ""
            }${data.address.country && data.address.city ? ", " : ""}${
              data.address.city ? data.address.city : ""
            }`;

            handleChange("location", location);
          } catch (err) {
            if (err) {
              setErrorMessage("Something went wrong. Please try again later.");
            }
          }
        },
        (error) => {
          if (error.code === 1) {
            setErrorMessage(error.message);
          } else {
            setErrorMessage("Could not determine your location.");
          }
        }
      );
    } catch (err) {
      if (err) {
        setErrorMessage("Permissions API is not available.");
      }
    }
  };

  return (
    <>
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          {fields.map((field) => (
            <Box key={field.key}>
              {field.type === "select" ? (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    value={formData[field.key] || ""}
                    onChange={(e) =>
                      handleChange(field.key, e.target.value as string)
                    }
                    label={field.label}
                  >
                    {field.options?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <>
                  <Box
                    sx={{
                      position: "relative",
                    }}
                  >
                    <TextField
                      autoComplete="off"
                      label={field.label}
                      value={formData[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      fullWidth
                      margin="normal"
                      required={allowEmpty ? false : true}
                    />
                    {field.key === "location" && (
                      <>
                        <Tooltip title="Find my location" placement="top">
                          <button
                            style={{
                              position: "absolute",
                              right: 20,
                              top: 50,
                              translate: "0 -70%",
                            }}
                            onClick={findLocation}
                          >
                            <MyLocationIcon
                              style={{ color: "var(--primary-color)" }}
                            />
                          </button>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </>
              )}
            </Box>
          ))}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={onClose} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ProfileEditModal;
