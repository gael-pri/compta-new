export const isStrongPassword = (password: string): boolean => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&/#.^()[\]{}\-_=+|~`<>])[A-Za-z\d@$!%*?&/#.^()[\]{}\-_=+|~`<>]{8,}$/;
  return regex.test(password);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
