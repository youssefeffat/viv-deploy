import { Link } from "react-router";
import { Home, Target, Users, User } from "lucide-react";
import viverisLogoBlanc from "../Pack_charte_graphique/Logos/Logos_Viveris/Sans signature/Viveris - Logo - Prod - RVB - Blanc.png";

interface NavigationProps {
  currentPage: string;
}

export function Navigation({ currentPage }: NavigationProps) {
  const links = [
    { to: "/dashboard", icon: Home, label: "Accueil", id: "dashboard" },
    { to: "/challenges", icon: Target, label: "Défis", id: "challenges" },
    { to: "/community", icon: Users, label: "Communauté", id: "community" },
    { to: "/profile", icon: User, label: "Profil", id: "profile" },
  ];

  return (
    <>
      {/* Mobile Navigation (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 max-w-md">
          {/* Navigation bar with rounded top corners */}
          <div 
            className="relative backdrop-blur-lg rounded-t-3xl shadow-2xl"
            style={{ 
              backgroundColor: 'var(--viv-navy)',
              paddingBottom: 'env(safe-area-inset-bottom)'
            }}
          >
            <div className="flex justify-around items-center h-20 pt-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = currentPage === link.id;
                return (
                  <Link
                    key={link.id}
                    to={link.to}
                    className="flex flex-col items-center justify-center gap-1 transition-colors min-w-[60px]"
                    style={{
                      color: isActive ? 'white' : 'rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Navigation (Sidebar) */}
      <nav className="hidden md:block fixed left-0 top-0 bottom-0 w-64 lg:w-72 z-40">
        <div 
          className="h-full flex flex-col p-6 shadow-xl"
          style={{ backgroundColor: 'var(--viv-navy)' }}
        >
          {/* Logo/Brand */}
          <div className="mb-8">
            <img src={viverisLogoBlanc} alt="Viveris" className="h-10 mb-2 object-contain" />
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Suivez votre empreinte carbone
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 space-y-2 mt-4">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <Link
                  key={link.id}
                  to={link.to}
                  className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all"
                  style={{
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-base font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <p className="text-xs text-center" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              © 2026 Projet génie logiciel - Polytech
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}
