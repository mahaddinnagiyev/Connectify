import { CreateFeedbackDTO } from "./dto/create-feedback-dto";

export const createFeedback = async (
  body: CreateFeedbackDTO
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(`${process.env.SERVER_USER_URL}/feedback/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return data;
};
