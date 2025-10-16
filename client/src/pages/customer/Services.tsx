import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge } from '../../components/ui';
import { Link } from 'react-router-dom';
import { serviceApi } from '../../services/realApi';
import { ServiceCategoryDto } from '../../types/service';
import { Zap, Wrench, Sparkles, Palette, Wind, Trees, MapPin, Search, Star, CheckCircle2 } from 'lucide-react';

interface Service {
  id: number;
  title: string;
  description: string;
  category: string;
  price: {
    min: number;
    max: number;
    type: 'hourly' | 'fixed' | 'quote';
  };
  rating: number;
  reviewCount: number;
  provider: {
    id: number;
    name: string;
    avatar?: string;
    verified: boolean;
  };
  images: string[];
  location: string;
  availability: 'available' | 'busy' | 'unavailable';
}

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategoryDto[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceRange: '',
    location: '',
    sortBy: 'rating'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await serviceApi.getCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const renderPriceRange = (price: Service['price']) => {
    if (price.type === 'quote') return 'Get Quote';
    if (price.min === price.max) {
      return `$${price.min}${price.type === 'hourly' ? '/hr' : ''}`;
    }
    return `$${price.min} - $${price.max}${price.type === 'hourly' ? '/hr' : ''}`;
  };

  const popularCategories = [
    { name: 'Electrical', icon: Zap, count: 245 },
    { name: 'Plumbing', icon: Wrench, count: 189 },
    { name: 'Cleaning', icon: Sparkles, count: 167 },
    { name: 'Painting', icon: Palette, count: 143 },
    { name: 'HVAC', icon: Wind, count: 98 },
    { name: 'Landscaping', icon: Trees, count: 87 }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2">
              Browse Services
            </h1>
            <p className="text-sm text-slate-600 leading-normal">
              Find verified professionals for all your utility needs
            </p>
          </div>
          <Link to="/request-service">
            <Button className="bg-slate-700 hover:bg-slate-800 text-white font-medium">
              + Request Service
            </Button>
          </Link>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 leading-snug mb-4">
          Popular Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {popularCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.name}
                onClick={() => handleFilterChange('category', category.name)}
                className="p-4 bg-white border border-slate-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <IconComponent className="w-5 h-5 text-slate-600" strokeWidth={2} />
                </div>
                <div className="font-medium text-slate-900 text-sm">{category.name}</div>
                <div className="text-xs text-slate-600">{category.count} services</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search services..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Select
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            >
              <option value="">Any Price</option>
              <option value="0-50">$0 - $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="100-200">$100 - $200</option>
              <option value="200+">$200+</option>
            </Select>
            <Select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="rating">Highest Rated</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="reviews">Most Reviews</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-200 h-48 rounded-lg mb-4 border border-slate-300"></div>
              <div className="h-4 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                {service.images.length > 0 && (
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                )}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={
                      service.availability === 'available' ? 'success' :
                      service.availability === 'busy' ? 'warning' : 'danger'
                    }
                    size="sm"
                  >
                    {service.availability}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-slate-900 line-clamp-2">
                    {service.title}
                  </h3>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-600">
                      {renderPriceRange(service.price)}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {service.description}
                </p>

                <div className="flex items-center mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(service.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-slate-600">
                      {service.rating} ({service.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {service.provider.avatar ? (
                      <img
                        src={service.provider.avatar}
                        alt={service.provider.name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-slate-200 rounded-full border border-slate-300"></div>
                    )}
                    <span className="ml-2 text-sm text-slate-700">
                      {service.provider.name}
                    </span>
                    {service.provider.verified && (
                      <span title="Verified Provider">
                        <CheckCircle2 className="ml-1 w-4 h-4 text-blue-500" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {service.location}
                  </span>
                  <div className="flex gap-2">
                    <Link to={`/services/${service.id}`}>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </Link>
                    <Link to={`/request-service/${service.id}`}>
                      <Button size="sm">
                        Request Service
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="p-12 text-center">
            <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No services found
            </h3>
            <p className="text-slate-600 mb-4">
              Try adjusting your search criteria or browse our popular categories
            </p>
            <Button onClick={() => setFilters({
              search: '',
              category: '',
              priceRange: '',
              location: '',
              sortBy: 'rating'
            })}>
              Clear Filters
            </Button>
          </div>
        </Card>
      )}
      </div>
    </div>
  );
};
