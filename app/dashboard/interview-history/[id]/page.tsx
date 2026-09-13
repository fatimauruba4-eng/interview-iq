export default async function InterviewDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex-1 p-6">
      <h1 className="text-2xl font-bold">
        Interview Details
      </h1>

      <p className="mt-4">
        Interview ID: {id}
      </p>
    </main>
  );
}