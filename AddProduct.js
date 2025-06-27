import fetch from "node-fetch";

async function addProduct() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NWFjNjhlZTBmOTI3YWIyMDI0Zjg4ZCIsImlhdCI6MTc1MDg0OTQ4NiwiZXhwIjoxNzUxNDU0Mjg2fQ.E-5LnuK2EL8t0k55_Ezc8jR02zxDye3USg9gHwBfI4k"; // استبدل بالتوكن الخاص بك
  const productData = {
    name: "منتج تجريبي",
    description: "وصف المنتج التجريبي",
    priceBeforeDiscount: 200,
    priceAfterDiscount: 150,
    quantity: 20,
    points: 100,
    image: "https://media.istockphoto.com/id/184276818/photo/red-apple.jpg?s=612x612&w=0&k=20&c=NvO-bLsG0DJ_7Ii8SSVoKLurzjmV0Qi4eGfn6nW3l5w=" // لو بتستخدم رابط الصورة مباشرة
  };

  try {
    const response = await fetch("http://localhost:4000/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // لو تستخدم حماية
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Product added successfully:", data);
    } else {
      console.error("Failed to add product:", data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

addProduct();
