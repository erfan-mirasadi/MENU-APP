import { getCategories } from "@/services/categoryService";

export default async function DashboardPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1>لیست دسته‌بندی‌ها</h1>
      {categories.length === 0 ? (
        <p>دیتایی نیست یا ارور داریم</p>
      ) : (
        categories.map((cat) => <div key={cat.id}>{cat.name}</div>)
      )}
    </div>
  );
}
