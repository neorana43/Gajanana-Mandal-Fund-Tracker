export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md text-center bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          🚫 Access Denied
        </h1>
        <p className="text-gray-700 mb-6">
          You do not have permission to view this page. Only admin users can
          access this section.
        </p>
        <a
          href="/dashboard/user"
          className="inline-block bg-maroon-700 text-white px-4 py-2 rounded hover:bg-maroon-800"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
