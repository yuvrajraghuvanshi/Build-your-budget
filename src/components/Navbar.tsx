import { useState } from "react";
import { Bell, User, PlusCircle, Menu, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Optional: Clear any local storage
      localStorage.removeItem("selectedCurrency");
      localStorage.removeItem("userProfile");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                {/* <img src="/assets/logo.png" alt="BYB" className="w-15 h-12"/> */}
              <div className=" text-white font-bold text-3xl rounded-lg px-3 py-2">
                BYB
                <span className="text-green-500 text-4xl rounded-lg">
                  .
                </span>
              </div>
            </div>

          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/">
              <Button variant="ghost" className={isActive('/') ? "text-primary" : "text-muted-foreground hover:text-primary"}>
                Dashboard
              </Button>
            </Link>
            <Link to="/transactions">
              <Button variant="ghost" className={isActive('/transactions') ? "text-primary" : "text-muted-foreground hover:text-primary"}>
                Transactions
              </Button>
            </Link>
            <Link to="/budgets">
              <Button variant="ghost" className={isActive('/budgets') ? "text-primary" : "text-muted-foreground hover:text-primary"}>
                Budgets
              </Button>
            </Link>
            <Link to="/goals">
              <Button variant="ghost" className={isActive('/goals') ? "text-primary" : "text-muted-foreground hover:text-primary"}>
                Goals
              </Button>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Add Transaction Button - Hidden on mobile */}
            {/* <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow hidden sm:flex">
              <PlusCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Transaction</span>
            </Button> */}

            {/* Notifications */}
            {/* <Link to="/notifications">
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-warning text-warning-foreground">
                    3
                  </Badge>
                </Button>
              </div>
            </Link> */}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-8 h-8 bg-gradient-success rounded-full flex items-center justify-center">
                  {/* <div className="w-8 h-8 bg-gradient-success rounded-full flex items-center justify-center"> */}
                  <User className="w-4 h-4 text-success-foreground" />
                  {/* </div> */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <Link to="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                </Link>
                {/* <Link to="/notifications">
                  <DropdownMenuItem className="cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                </Link> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border py-4">
            <div className="flex flex-col space-y-4 px-4">
              <Link to="/" onClick={toggleMobileMenu}>
                <Button variant="ghost" className={`w-full justify-start ${isActive('/') ? "text-primary" : "text-muted-foreground"}`}>
                  Dashboard
                </Button>
              </Link>
              <Link to="/transactions" onClick={toggleMobileMenu}>
                <Button variant="ghost" className={`w-full justify-start ${isActive('/transactions') ? "text-primary" : "text-muted-foreground"}`}>
                  Transactions
                </Button>
              </Link>
              <Link to="/budgets" onClick={toggleMobileMenu}>
                <Button variant="ghost" className={`w-full justify-start ${isActive('/budgets') ? "text-primary" : "text-muted-foreground"}`}>
                  Budgets
                </Button>
              </Link>
              <Link to="/goals" onClick={toggleMobileMenu}>
                <Button variant="ghost" className={`w-full justify-start ${isActive('/goals') ? "text-primary" : "text-muted-foreground"}`}>
                  Goals
                </Button>
              </Link>
              {/* <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow w-full justify-start mt-4">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Transaction
              </Button> */}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};