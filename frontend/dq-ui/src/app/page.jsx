import FileUpload from '@/components/FileUpload';

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Data Quality Tool</h1>
      <FileUpload />
    </main>
  );
}
