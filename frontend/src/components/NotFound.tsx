import { Link } from "react-router";
import { Leaf } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--viv-beige)] flex items-center justify-center p-4">
      <div className="text-center">
        <Leaf className="w-16 h-16 text-[var(--viv-red)] mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-[var(--viv-navy)] mb-2">404</h1>
        <p className="text-[var(--viv-navy)] mb-6">Page non trouvée</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-[var(--viv-red)] text-white rounded-full font-semibold hover:bg-[var(--viv-red-dark)] transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
