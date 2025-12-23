import Loader from "@/app/admin/_components/ui/Loader";

export default function AdminLoading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-dark-900 z-50">
      <Loader size="large" />
      <p className="mt-4 text-text-dim text-sm animate-pulse">Loading...</p>
    </div>
  );
}
