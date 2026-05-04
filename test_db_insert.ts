import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { productsTable } from "./api/_lib/schema";

async function main() {
  const pool = new pg.Pool({
    connectionString: "postgresql://postgres.pipyswesqgzqojeezmno:hello90%40%40%40%40%40%4022@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres",
    max: 5,
    idleTimeoutMillis: 30000,
  });

  const db = drizzle(pool);

  try {
    console.log("Attempting insert...");
    const [product] = await db.insert(productsTable).values({
      name: "TEST SCRIPT",
      description: "Test",
      shortDescription: "Short test",
      price: "100",
      salePrice: "90",
      imageUrl: "data:image/jpeg;base64,aGVsbG8=",
      category: "tshirt",
      sizes: ["S", "M"],
      colors: ["White"],
      featured: false,
      stock: 10,
      customAttributes: { material: "cotton" },
    }).returning();
    console.log("Success:", product);
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    pool.end();
  }
}

main();
