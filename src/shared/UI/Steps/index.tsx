import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import React from 'react';

export interface Step {
  label: string;
}

interface StepsProps {
  steps: Step[];
  /** 1-indexed */ currentStep: number;
  className?: string;
}

const Steps: React.FC<StepsProps> = ({ steps, currentStep, className }) => {
  const progress = steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 100;

  return (
    <div dir="rtl" className={cn('relative w-full px-0', className)}>
      <style>{`
        @keyframes shimmer-rtl {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer-rtl {
          background-size: 200% 100%;
          animation: shimmer-rtl 2s linear infinite;
        }
      `}</style>

      {/* Base gray line */}
      <div
        className="absolute right-0 top-13 md:top-15 h-0.5 w-full bg-[#E2E8F0]"
        aria-hidden="true"
      />

      {/* Completed/active blue line with RTL shimmer */}
      <div
        className="absolute right-0 top-13 md:top-15 h-0.5 animate-shimmer-rtl transition-all duration-300"
        style={{
          width: `${progress}%`,
          backgroundImage:
            'linear-gradient(90deg, #1976F3 0%, #60A5FA 25%, #BFDBFE 50%, #60A5FA 75%, #1976F3 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative flex w-full justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={`${step.label}-${stepNumber}`} className="flex w-full flex-col items-center">
              {/* Label */}
              <div className="mb-3 h-7 text-center">
                <span
                  className={cn(
                    'whitespace-nowrap text-[10px] md:text-sm font-medium',
                    isCompleted || isCurrent ? 'text-[#222]' : 'text-[#444]'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Step circle */}
              <div
                className={cn(
                  'relative z-10 flex items-center justify-center rounded-full font-medium transition-all duration-300',
                  isCompleted &&
                    'size-6 md:size-10 border-2 border-[#1976F3] bg-[#1976F3] text-white',
                  isCurrent &&
                    'size-7 md:size-11 border-2 border-[#1976F3] bg-[#E5F0FF] text-[#1976F3]',
                  isUpcoming && 'size-6 md:size-10 border-2 border-[#AAB3C2] bg-white text-[#333]'
                )}
              >
                {isCompleted ? (
                  <Check className="size-3.5 md:size-5 stroke-3" />
                ) : (
                  <span className="text-base">{stepNumber.toLocaleString('fa-IR')}</span>
                )}

                {/* Shimmer border overlay for completed steps */}
                {isCompleted && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-full animate-shimmer-rtl"
                    style={{
                      padding: '2px',
                      background:
                        'linear-gradient(90deg, #1976F3 0%, #93C5FD 25%, #FFFFFF 50%, #93C5FD 75%, #1976F3 100%)',
                      backgroundSize: '200% 100%',
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'exclude',
                      WebkitMaskComposite: 'xor',
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Steps;
