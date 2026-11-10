import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="max-w-xl">
        <p className="font-serif text-8xl text-brand-600 italic">404</p>
        <h1 className="display-2 mt-4">This page took a day off.</h1>
        <p className="mt-4 text-lg text-muted">The page you are looking for does not exist or has been moved.</p>
        <Link href="/" className="btn btn-dark btn-lg mt-8">Back to home</Link>
      </div>
    </div>
  );
}
