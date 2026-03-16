import argon2 from "argon2";

async function hashPassword() {
  const password = "argostack";
  try {
    const hashedPassword = await argon2.hash(password);
    console.log("Hashed password:", hashedPassword);
  } catch (err) {
    console.error("Erreur hashage argon2:", err);
  }
}

hashPassword();
