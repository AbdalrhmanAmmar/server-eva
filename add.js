import axios from "axios";

const API_URL = "http://localhost:4000/api/points";

async function testCreatePointsPackage() {
  try {
    const response = await axios.post(
      `${API_URL}`,
      {
        pointsAmount: 1000,
        price: 25,
      },
      {
        // لو عندك توكن للتوثيق أضفه هنا
        headers: {
        //   "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NWYzNTQwYmY5MjAxMDk5OTkzZThjZiIsImlhdCI6MTc1MTA3MDA1NywiZXhwIjoxNzUxNjc0ODU3fQ.5ieBs22nPEUcKGA1udBy7NKxOYPetAj5iax8xaVrywA`,
          "Content-Type": "application/json",
        },
        // لو السيرفر بيستخدم الكوكيز مع CORS
        withCredentials: true,
      }
    );

    console.log("Response status:", response.status);
    console.log("Response data:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Error response status:", error.response.status);
      console.error("Error response data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testCreatePointsPackage();
