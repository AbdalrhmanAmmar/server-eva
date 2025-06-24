export const sendToken = (user, statusCode, message, res) => {
  const token = user.generateToken(); // يفترض أن لديك method اسمها generateToken داخل user model

  const options = {
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 يوم
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // فقط في HTTPS إذا كنت في production
    sameSite: "strict",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
    },
    token,
  });
};
