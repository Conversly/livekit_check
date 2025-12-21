'use client';

import * as React from 'react';
import { PhoneIcon } from '@phosphor-icons/react';

interface PhoneCallInputProps {
  onCall: (phoneNumber: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PhoneCallInput({ onCall, isLoading = false, disabled = false }: PhoneCallInputProps) {
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const validatePhoneNumber = (number: string): boolean => {
    // Basic E.164 format validation: + followed by 1-15 digits
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(number);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    // Ensure phone number starts with +
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    if (!validatePhoneNumber(formattedNumber)) {
      setError('Please enter a valid phone number in E.164 format (e.g., +1234567890)');
      return;
    }

    onCall(formattedNumber);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    setError(null);
  };

  return (
    <div className="w-full space-y-4 rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="phone-number" className="block text-sm font-medium text-black">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <PhoneIcon className="h-5 w-5 text-gray-400" weight="bold" />
            </div>
            <input
              id="phone-number"
              type="tel"
              value={phoneNumber}
              onChange={handleChange}
              placeholder="+1234567890"
              disabled={disabled || isLoading}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <p className="text-xs text-black/60">
            Enter phone number in E.164 format (e.g., +1234567890)
          </p>
        </div>
        <button
          type="submit"
          disabled={disabled || isLoading || !phoneNumber.trim()}
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-lg font-bold text-white transition-all hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Calling...
            </>
          ) : (
            <>
              <PhoneIcon className="h-5 w-5" weight="bold" />
              Make Call
            </>
          )}
        </button>
      </form>
    </div>
  );
}


