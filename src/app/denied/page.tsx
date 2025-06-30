export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-sm">
        <h1 className="text-3xl font-bold text-destructive mb-2">
          Access Denied
        </h1>
        <p className="text-muted-foreground mb-6">
          You do not have permission to view this page.
        </p>
        <a
          href="/dashboard"
          className="inline-block bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
