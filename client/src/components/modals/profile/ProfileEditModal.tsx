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
} from "@mui/material";

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
  allowEmpty?: boolean; // Yeni prop: inputların boş qalmasına icazə verilsin ya yox
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

  return (
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
              <TextField
                label={field.label}
                value={formData[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                fullWidth
                margin="normal"
                required={allowEmpty ? false : true}
              />
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
  );
};

export default ProfileEditModal;
