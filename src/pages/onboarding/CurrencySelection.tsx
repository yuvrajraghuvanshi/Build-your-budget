import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Check } from "lucide-react";

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CHF", name: "Swiss Franc", symbol: "₣", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
];

const CurrencySelection = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContinue = () => {
    if (!selectedCurrency) {
      toast({
        title: "Please select a currency",
        description: "Choose your preferred currency to continue",
        variant: "destructive",
      });
      return;
    }

    // Store currency selection (you can integrate with backend later)
    localStorage.setItem("selectedCurrency", selectedCurrency);
    
    toast({
      title: "Currency selected!",
      description: `${selectedCurrency} has been set as your default currency`,
    });
    
    navigate("/onboarding/profile-setup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">₱</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">PennyPinch</h1>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Currency</h2>
          <p className="text-muted-foreground">
            Select your preferred currency for tracking expenses and budgets
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg">
          <CardContent className="p-6">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search currencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Currency Grid */}
            <div className="grid gap-3 mb-6 max-h-96 overflow-y-auto">
              {filteredCurrencies.map((currency) => (
                <div
                  key={currency.code}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                    selectedCurrency === currency.code
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background/50"
                  }`}
                  onClick={() => setSelectedCurrency(currency.code)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{currency.flag}</span>
                      <div>
                        <div className="font-medium text-foreground">
                          {currency.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {currency.code} • {currency.symbol}
                        </div>
                      </div>
                    </div>
                    {selectedCurrency === currency.code && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/auth/login")}
              >
                Back
              </Button>
              <Button className="flex-1" onClick={handleContinue}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CurrencySelection;