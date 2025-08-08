'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BuildingOfficeIcon,
  UserIcon,
  MapPinIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface BusinessRegistrationNavProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

const steps = [
  { id: 1, name: 'Business Info', icon: BuildingOfficeIcon },
  { id: 2, name: 'Contact', icon: UserIcon },
  { id: 3, name: 'Location', icon: MapPinIcon },
  { id: 4, name: 'Verification', icon: DocumentTextIcon },
  { id: 5, name: 'Marketing', icon: CheckCircleIcon },
];

export default function BusinessRegistrationNav({ currentStep, onStepChange }: BusinessRegistrationNavProps) {
  const router = useRouter();

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/customer')}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          <div className="flex items-center space-x-8">
            <nav aria-label="Progress">
              <ol className="flex items-center space-x-4">
                {steps.map((step, stepIdx) => (
                  <li key={step.name} className="flex items-center">
                    <button
                      onClick={() => onStepChange(step.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        step.id === currentStep
                          ? 'bg-blue-100 text-blue-700'
                          : step.id < currentStep
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {step.id < currentStep ? (
                        <CheckCircleIcon className="h-4 w-4" />
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">{step.name}</span>
                    </button>
                    
                    {stepIdx < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 ${
                        step.id < currentStep ? 'bg-green-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 