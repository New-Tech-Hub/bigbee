import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  currency: string;
  categories?: {
    name: string;
    slug: string;
  };
}

interface SearchBarProps {
  onClose?: () => void;
  className?: string;
}

const SearchBar = ({ onClose, className = "" }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const searchProducts = async () => {
      setLoading(true);
      try {
        // Search products by name and description
        const { data: products, error: productError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            image_url,
            currency,
            categories (
              name,
              slug
            )
          `)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .eq('is_active', true)
          .limit(8);

        if (productError) throw productError;

        // Also search for products by category name
        const { data: categoryProducts, error: categoryError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            image_url,
            currency,
            categories!inner (
              name,
              slug
            )
          `)
          .ilike('categories.name', `%${query}%`)
          .eq('is_active', true)
          .limit(8);

        if (categoryError) throw categoryError;

        // Combine and deduplicate results
        const allResults = [...(products || []), ...(categoryProducts || [])];
        const uniqueResults = allResults.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        ).slice(0, 8);

        setResults(uniqueResults);
        setShowResults(true);
      } catch (error) {
        // Search error handled silently
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleResultClick = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    onClose?.();
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setResults([]);
      setShowResults(false);
      onClose?.();
    }
  };

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString()}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative group">
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 cursor-pointer transition-all duration-300 group-hover:text-gold group-focus-within:text-gold" 
          onClick={handleSearch}
        />
        <Input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 transition-all duration-300 focus:ring-2 focus:ring-accent/50 hover:border-accent/50"
          onFocus={() => query.length >= 2 && setShowResults(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(e);
            }
          }}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent/20 transition-all duration-300"
            onClick={() => {
              setQuery("");
              setResults([]);
              setShowResults(false);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </form>

      {showResults && query.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto bg-background/95 backdrop-blur-sm border shadow-[0_8px_30px_rgba(0,0,0,0.12)] animate-in fade-in slide-in-from-top-2 duration-300 rounded-lg">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-3">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No products found for "{query}"</p>
            </div>
          ) : (
            <div className="p-2">
              <p className="text-xs font-medium text-muted-foreground px-3 py-2 mb-1 bg-accent/10 rounded-md">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((product, index) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={handleResultClick}
                  className="flex items-center space-x-3 p-3 hover:bg-gradient-to-r hover:from-accent/20 hover:to-accent/10 rounded-lg transition-all duration-300 hover:shadow-md hover:scale-[1.02] group animate-in fade-in slide-in-from-left-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate group-hover:text-gold-dark transition-colors duration-300">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-semibold text-gold group-hover:text-gold-dark transition-colors duration-300">
                        {formatCurrency(product.price, product.currency)}
                      </p>
                      {product.categories && (
                        <span className="text-xs text-muted-foreground bg-accent/20 px-2 py-1 rounded-full">
                          {product.categories.name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default SearchBar;