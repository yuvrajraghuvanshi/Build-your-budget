import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/3 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/2 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo and Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:border-primary/30 transition-colors duration-300">
              <img 
                src="/assets/logo.png" 
                alt="BYB" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Build Your Budget
              </h1>
              <div className="w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent mt-1"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-8 shadow-xl shadow-black/5 relative overflow-hidden">
          {/* Card decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.01] pointer-events-none"></div>
          
          {/* Card border glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 transition-opacity duration-500 hover:opacity-100 pointer-events-none"></div>
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
        
        {/* Footer text */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground/70">
            Secure • Reliable • Easy to use
          </p>
        </div>
      </div>
    </div>
  );
};