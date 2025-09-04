import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">₱</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">PennyPinch</h1>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Content */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
};