import React from 'react';
import { Building2, User, Users } from 'lucide-react';
import { MembershipType } from '../../lib/stripe';

interface MembershipTypeSelectorProps {
  selectedType: MembershipType | null;
  onSelect: (type: MembershipType) => void;
}

export function MembershipTypeSelector({ selectedType, onSelect }: MembershipTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        type="button"
        onClick={() => onSelect('clinic')}
        className={`p-6 text-left rounded-lg border-2 transition-colors ${
          selectedType === 'clinic'
            ? 'border-kapstone-sage bg-kapstone-sage/5'
            : 'border-gray-200 hover:border-kapstone-sage/50'
        }`}
      >
        <div className="flex items-center mb-4">
          <Building2 className="h-8 w-8 text-kapstone-sage" />
        </div>
        <h4 className="text-lg font-semibold mb-2">Clinic</h4>
        <p className="text-sm text-gray-600">
          Multi-disciplinary practice with a team of providers
        </p>
      </button>

      <button
        type="button"
        onClick={() => onSelect('solo')}
        className={`p-6 text-left rounded-lg border-2 transition-colors ${
          selectedType === 'solo'
            ? 'border-kapstone-sage bg-kapstone-sage/5'
            : 'border-gray-200 hover:border-kapstone-sage/50'
        }`}
      >
        <div className="flex items-center mb-4">
          <User className="h-8 w-8 text-kapstone-sage" />
        </div>
        <h4 className="text-lg font-semibold mb-2">Solo Practitioner</h4>
        <p className="text-sm text-gray-600">
          Individual provider with both medical and therapy expertise
        </p>
      </button>

      <button
        type="button"
        onClick={() => onSelect('affiliate')}
        className={`p-6 text-left rounded-lg border-2 transition-colors ${
          selectedType === 'affiliate'
            ? 'border-kapstone-sage bg-kapstone-sage/5'
            : 'border-gray-200 hover:border-kapstone-sage/50'
        }`}
      >
        <div className="flex items-center mb-4">
          <Users className="h-8 w-8 text-kapstone-sage" />
        </div>
        <h4 className="text-lg font-semibold mb-2">Affiliate</h4>
        <p className="text-sm text-gray-600">
          Access member resources without a directory listing
        </p>
      </button>
    </div>
  );
}