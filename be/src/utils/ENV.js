import dotenv from "dotenv";
dotenv.config();

const envVariables = {
  MONGODB_URI: process.env.MONGODB_URI || "",
  PORT: process.env.PORT || "3000",
  JWT_SECRET: process.env.JWT_SECRET || "",
};

if (!envVariables.MONGODB_URI) {
  throw new Error("MONGODB_URI belum diisi di file .env");
}
if (!envVariables.JWT_SECRET) {
  throw new Error("JWT_SECRET belum diisi di file .env");
}

export default envVariables;
