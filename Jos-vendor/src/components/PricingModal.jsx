import React, { useState } from 'react';
import { X, Check, Crown, Zap, Star } from 'lucide-react';

const PricingModal = ({ isOpen, onClose, onSelectPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '₦3,000',
      period: '/month',
      originalPrice: '₦5,000',
      badge: 'Most Popular',
      badgeColor: 'bg-blue-500',
      icon: Crown,
      iconColor: 'text-blue-600',
      bgColor: 'border-blue-200 bg-blue-50',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      features: [
        'Unlimited product listings',
        'Advanced analytics dashboard',
        'Priority customer support',
        'Custom store branding',
        'Payment processing integration',
        'Inventory management tools',
        'Mobile app access',
        'Basic marketing tools'
      ]
    },
    {
      id: 'pro-plus',
      name: 'Pro Plus Plan',
      price: '₦5,000',
      period: '/month',
      originalPrice: '₦15,000',
      badge: 'Premium',
      badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
      icon: Zap,
      iconColor: 'text-purple-600',
      bgColor: 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50',
      buttonColor: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
      features: [
        'Everything in Pro Plan',
        'AI-powered sales insights',
        'Advanced marketing automation',
        'Multi-location management',
        'Dedicated account manager',
        'Custom API integrations',
        'White-label solutions',
        'Advanced security features',
        'Bulk import/export tools',
        'Priority feature requests'
      ]
    }
  ];

  const handlePlanSelection = (planId) => {
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    if (selectedPlan) {
      onSelectPlan(selectedPlan);
    }
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Jos Vendor Hub!
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Choose the perfect plan to grow your business. Start with your first month free and unlock powerful tools to boost your sales.
            </p>
          </div>
        </div>

        {/* Free First Month Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-1">🎉 Special Launch Offer</h3>
            <p className="text-emerald-100">Get your first month completely FREE on any plan!</p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              
              return (
                <div
                  key={plan.id}
                  onClick={() => handlePlanSelection(plan.id)}
                  className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${
                    isSelected 
                      ? 'border-emerald-500 shadow-lg scale-105' 
                      : `hover:border-emerald-300 ${plan.bgColor}`
                  }`}
                >
                  {/* Badge */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className={`${plan.badgeColor} text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg`}>
                      {plan.badge}
                    </span>
                  </div>

                  {/* Plan Header */}
                  <div className="text-center mb-6 mt-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md mb-3">
                      <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-through">{plan.originalPrice}</p>
                    <div className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full inline-block">
                      First Month FREE
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-emerald-500 rounded-xl pointer-events-none">
                      <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSkip}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip for Now
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedPlan}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                selectedPlan
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedPlan ? 'Start Free Trial' : 'Select a Plan'}
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              No credit card required for the free trial. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
