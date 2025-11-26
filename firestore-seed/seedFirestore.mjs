// seedFirestore.mjs
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// === Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyA6nUavgaS6RdWbnBEP47K6kz98aOg_k0M",
  authDomain: "cnpm-eb8ca.firebaseapp.com",
  projectId: "cnpm-eb8ca",
  storageBucket: "cnpm-eb8ca.firebasestorage.app",
  messagingSenderId: "257791647638",
  appId: "1:257791647638:web:5bb9a27b7c92536a0c47b7",
  measurementId: "G-3JYT7C0TJY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === Đọc JSON ===
const raw = fs.readFileSync("./data.json", "utf-8");
const data = JSON.parse(raw);

// === Hàm import 1 collection ===
async function seedCollection(collectionName, items) {
  console.log(`\n=== Import "${collectionName}" (${items.length} docs) ===`);

  for (const item of items) {
    // Ưu tiên: id, nếu không có thì dùng orderId (cho routes)
    const id = item.id || item.orderId;

    if (!id) {
      console.warn(`  !! Bỏ qua 1 item trong ${collectionName} vì không có id/orderId`);
      continue;
    }

    const ref = doc(db, collectionName, id);

    // Bỏ id nếu không muốn lưu; orderId vẫn giữ lại cho routes (hoặc bỏ tuỳ bạn)
    const { id: _omit, ...rest } = item;

    await setDoc(ref, rest);
    console.log(`  -> Imported ${collectionName}/${id}`);
  }
}


// === Chạy seed ===
async function main() {
  try {
    if (data.products) await seedCollection("products", data.products);
    if (data.restaurants) await seedCollection("restaurants", data.restaurants);
    if (data.users) await seedCollection("users", data.users);
    if (data.orders) await seedCollection("orders", data.orders);
    if (data.drones) await seedCollection("drones", data.drones);
    if (data.routes) await seedCollection("routes", data.routes);

    console.log("\n🎉 Tất cả dữ liệu đã import thành công!");
  } catch (err) {
    console.error("❌ Lỗi import:", err);
  }
}

main();
