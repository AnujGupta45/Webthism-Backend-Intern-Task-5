import app from "./src/app";
import prisma from "./src/config/db";

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log("[Test] Starting test server on port 3001...");
  const server = app.listen(PORT);

  try {
    // Clear test database to make it clean
    console.log("[Test] Cleaning database tables...");
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log("[Test] Running Authentication tests...");
    
    // 1. Register a normal user
    const regResUser = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com", password: "password123" }),
    });
    const regUser: any = await regResUser.json();
    console.log("[Test] Register User response status:", regResUser.status);
    if (regResUser.status !== 201) throw new Error("Failed to register normal user");

    // 2. Register an admin user
    const regResAdmin = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "adminpassword", role: "ADMIN" }),
    });
    const regAdmin: any = await regResAdmin.json();
    console.log("[Test] Register Admin response status:", regResAdmin.status);
    if (regResAdmin.status !== 201) throw new Error("Failed to register admin user");
    const adminToken = regAdmin.token;

    // 3. Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com", password: "password123" }),
    });
    const loginData: any = await loginRes.json();
    console.log("[Test] Login User response status:", loginRes.status);
    if (loginRes.status !== 200) throw new Error("Failed to login");
    const userToken = loginData.token;

    console.log("[Test] Running Category tests...");
    
    // 4. Create Category as non-admin (should fail with 403)
    const catResFail = await fetch(`${BASE_URL}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userToken}`,
      },
      body: JSON.stringify({ name: "Electronics", description: "Gadgets and tech" }),
    });
    console.log("[Test] Create Category as User status:", catResFail.status);
    if (catResFail.status !== 403) throw new Error("User was allowed to create category");

    // 5. Create Category as Admin (should succeed)
    const catResSuccess = await fetch(`${BASE_URL}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: "Electronics", description: "Gadgets and tech" }),
    });
    const catData: any = await catResSuccess.json();
    console.log("[Test] Create Category as Admin status:", catResSuccess.status);
    if (catResSuccess.status !== 201) throw new Error("Admin failed to create category");
    const categoryId = catData.data.category.id;

    console.log("[Test] Running Product tests...");
    
    // 6. Create Product as non-admin (should fail with 403)
    const prodResFail = await fetch(`${BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: "Smartphone",
        description: "Latest model 5G phone",
        price: 999.99,
        stock: 50,
        categoryId,
      }),
    });
    console.log("[Test] Create Product as User status:", prodResFail.status);
    if (prodResFail.status !== 403) throw new Error("User was allowed to create product");

    // 7. Create Product as Admin (should succeed)
    const prodResSuccess = await fetch(`${BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: "Smartphone X",
        description: "Premium model 5G phone",
        price: 1099.99,
        stock: 45,
        categoryId,
      }),
    });
    const prodData: any = await prodResSuccess.json();
    console.log("[Test] Create Product as Admin status:", prodResSuccess.status);
    if (prodResSuccess.status !== 201) throw new Error("Admin failed to create product");
    const productId = prodData.data.product.id;

    // 8. Create another Product for filtering tests
    const prodResSuccess2 = await fetch(`${BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: "Wired Headphones",
        description: "Noise cancelling wired headphones",
        price: 149.99,
        stock: 120,
        categoryId,
      }),
    });
    console.log("[Test] Create Second Product status:", prodResSuccess2.status);

    console.log("[Test] Running Search and Filter tests...");
    
    // 9. Get all products (unfiltered)
    const getResAll = await fetch(`${BASE_URL}/api/products`);
    const allProds: any = await getResAll.json();
    console.log("[Test] Get all products count:", allProds.data.products.length);
    if (allProds.data.products.length !== 2) throw new Error("Unfiltered count mismatch");

    // 10. Filter by max price
    const getResFiltered = await fetch(`${BASE_URL}/api/products?maxPrice=200`);
    const filteredProds: any = await getResFiltered.json();
    console.log("[Test] Get products with maxPrice=200 count:", filteredProds.data.products.length);
    if (filteredProds.data.products.length !== 1 || filteredProds.data.products[0].name !== "Wired Headphones") {
      throw new Error("Price filtering failed");
    }

    // 11. Search products by query keyword
    const getResSearch = await fetch(`${BASE_URL}/api/products?search=Smartphone`);
    const searchProds: any = await getResSearch.json();
    console.log("[Test] Get products search='Smartphone' count:", searchProds.data.products.length);
    if (searchProds.data.products.length !== 1 || searchProds.data.products[0].name !== "Smartphone X") {
      throw new Error("Search functionality failed");
    }

    console.log("[Test] Running Product detail, update, and delete tests...");
    
    // 12. Get Product Detail
    const getDetailRes = await fetch(`${BASE_URL}/api/products/${productId}`);
    const detailData: any = await getDetailRes.json();
    console.log("[Test] Get product detail status:", getDetailRes.status);
    if (getDetailRes.status !== 200 || detailData.data.product.name !== "Smartphone X") {
      throw new Error("Failed to get product details");
    }

    // 13. Update Product
    const updateRes = await fetch(`${BASE_URL}/api/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ price: 1049.99, stock: 40 }),
    });
    const updateData: any = await updateRes.json();
    console.log("[Test] Update product status:", updateRes.status);
    if (updateRes.status !== 200 || updateData.data.product.price !== 1049.99 || updateData.data.product.stock !== 40) {
      throw new Error("Update product failed");
    }

    // 14. Delete Product
    const deleteRes = await fetch(`${BASE_URL}/api/products/${productId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${adminToken}`,
      },
    });
    console.log("[Test] Delete product status:", deleteRes.status);
    if (deleteRes.status !== 204) throw new Error("Delete product failed");

    // 15. Verify product is deleted
    const verifyDelRes = await fetch(`${BASE_URL}/api/products/${productId}`);
    console.log("[Test] Verify delete status:", verifyDelRes.status);
    if (verifyDelRes.status !== 404) throw new Error("Product was not deleted successfully");

    console.log("\n==========================================");
    console.log("ALL TESTS COMPLETED SUCCESSFULLY! 🎉");
    console.log("==========================================");

  } catch (error) {
    console.error("[Test] Test suite failed:", error);
    process.exit(1);
  } finally {
    console.log("[Test] Stopping test server...");
    server.close();
    await prisma.$disconnect();
  }
}

runTests();
