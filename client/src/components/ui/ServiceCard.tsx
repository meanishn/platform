/**
 * ServiceCard Component
 * 
 * Displays a service listing with image, details, provider info, and actions.
 * Shows service title, description, pricing, rating, location, and availability.
 * Follows design system for consistent styling.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, ProviderRating } from './';
import { MapPin, CheckCircle2 } from 'lucide-react';

interface ServicePrice {
  min: number;
  max: number;
  type: 'hourly' | 'fixed' | 'quote';
}

interface ServiceProvider {
  id: number;
  name: string;
  avatar?: string;
  verified: boolean;
}

export interface ServiceCardProps {
  id: number;
  title: string;
  description: string;
  category: string;
  price: ServicePrice;
  rating: number;
  reviewCount: number;
  provider: ServiceProvider;
  images: string[];
  location: string;
  availability: 'available' | 'busy' | 'unavailable';
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  title,
  description,
  price,
  rating,
  reviewCount,
  provider,
  images,
  location,
  availability,
  className = '',
}) => {
  const renderPriceRange = (servicePrice: ServicePrice) => {
    if (servicePrice.type === 'quote') return 'Get Quote';
    if (servicePrice.min === servicePrice.max) {
      return `$${servicePrice.min}${servicePrice.type === 'hourly' ? '/hr' : ''}`;
    }
    return `$${servicePrice.min} - $${servicePrice.max}${servicePrice.type === 'hourly' ? '/hr' : ''}`;
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <div className="relative">
        {images.length > 0 && (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-48 object-cover rounded-t-xl"
          />
        )}
        <div className="absolute top-3 right-3">
          <Badge
            variant={
              availability === 'available' ? 'success' :
              availability === 'busy' ? 'warning' : 'danger'
            }
            size="sm"
          >
            {availability}
          </Badge>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-slate-900 line-clamp-2 flex-1">
            {title}
          </h3>
          <div className="text-right ml-2">
            <div className="font-semibold text-emerald-600">
              {renderPriceRange(price)}
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {description}
        </p>

        <div className="mb-4">
          <ProviderRating
            rating={rating}
            totalJobs={reviewCount}
            size="sm"
            showJobCount={false}
          />
          <span className="text-xs text-slate-500 ml-1">
            ({reviewCount} reviews)
          </span>
        </div>

        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {provider.avatar ? (
              <img
                src={provider.avatar}
                alt={provider.name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-slate-200 rounded-full border border-slate-300"></div>
            )}
            <span className="ml-2 text-sm text-slate-700">
              {provider.name}
            </span>
            {provider.verified && (
              <span title="Verified Provider">
                <CheckCircle2 className="ml-1 w-4 h-4 text-blue-500" />
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {location}
          </span>
          <div className="flex gap-2">
            <Link to={`/services/${id}`}>
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </Link>
            <Link to={`/request-service/${id}`}>
              <Button size="sm">
                Request Service
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

