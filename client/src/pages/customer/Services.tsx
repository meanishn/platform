/**
 * Services Page
 * 
 * Browse and search for available services.
 * REFACTORED: Following design system and refactor guidelines.
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  CategoryButton, 
  ServiceCard, 
  EmptyState, 
  LoadingSkeleton,
  SearchBar,
  SortDropdown,
  FilterSelect,
  PageContainer,
} from '../../components/ui';
import { Link } from 'react-router-dom';
import { serviceApi } from '../../services/realApi';
import { ServiceCategoryDto } from '../../types/service';
import { Zap, Wrench, Sparkles, Palette, Wind, Trees, Search } from 'lucide-react';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [services, setServices] = useState<Service[]>([]); // TODO: Implement service fetching API
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

  const popularCategories = [
    { name: 'Electrical', icon: Zap, count: 245 },
    { name: 'Plumbing', icon: Wrench, count: 189 },
    { name: 'Cleaning', icon: Sparkles, count: 167 },
    { name: 'Painting', icon: Palette, count: 143 },
    { name: 'HVAC', icon: Wind, count: 98 },
    { name: 'Landscaping', icon: Trees, count: 87 }
  ];

  return (
    <PageContainer maxWidth="7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2">
              Browse Services
            </h1>
            <p className="text-sm text-slate-600 leading-normal">
              Find verified professionals for all your utility needs
            </p>
          </div>
          <Link to="/request-service">
            <Button variant="primary">
              + Request Service
            </Button>
          </Link>
        </div>

      {/* Popular Categories */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 leading-snug mb-4">
          Popular Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {popularCategories.map((category) => (
            <CategoryButton
              key={category.name}
              name={category.name}
              icon={category.icon}
              count={category.count}
              onClick={() => handleFilterChange('category', category.name)}
            />
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <SearchBar
                value={filters.search}
                onChange={(value) => handleFilterChange('search', value)}
                placeholder="Search services..."
              />
            </div>
            <FilterSelect
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
              placeholder="All Categories"
              options={categories.map((category) => ({
                value: category.name,
                label: category.name,
              }))}
            />
            <FilterSelect
              value={filters.priceRange}
              onChange={(value) => handleFilterChange('priceRange', value)}
              placeholder="Any Price"
              options={[
                { value: '0-50', label: '$0 - $50' },
                { value: '50-100', label: '$50 - $100' },
                { value: '100-200', label: '$100 - $200' },
                { value: '200+', label: '$200+' },
              ]}
            />
            <SortDropdown
              value={filters.sortBy}
              onChange={(value) => handleFilterChange('sortBy', value)}
              options={[
                { value: 'rating', label: 'Highest Rated' },
                { value: 'price_low', label: 'Price: Low to High' },
                { value: 'price_high', label: 'Price: High to Low' },
                { value: 'reviews', label: 'Most Reviews' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton type="card" count={6} />
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No services found"
          description="Try adjusting your search criteria or browse our popular categories"
          action={{
            label: 'Clear Filters',
            onClick: () => setFilters({
              search: '',
              category: '',
              priceRange: '',
              location: '',
              sortBy: 'rating'
            }),
          }}
        />
      )}
    </PageContainer>
  );
};
