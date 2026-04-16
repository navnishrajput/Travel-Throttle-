/**
 * RIDE STATUS COMPONENT
 * Displays ride status with progress tracking
 */

import { cn } from '../../utils/helpers';
import { RIDE_STATUS } from '../../constants';
import { Badge } from '../common';
import { 
  FiCheckCircle, 
  FiClock, 
  FiNavigation, 
  FiXCircle,
  FiMapPin 
} from 'react-icons/fi';

export const RideStatus = ({ 
  status = 'UPCOMING',
  source = '',
  destination = '',
  showProgress = true,
  className = '' 
}) => {
  const statusConfig = RIDE_STATUS[status] || RIDE_STATUS.UPCOMING;
  
  const steps = [
    { 
      id: 'upcoming', 
      label: 'Upcoming', 
      icon: FiClock,
      completed: status === 'ONGOING' || status === 'COMPLETED',
      active: status === 'UPCOMING'
    },
    { 
      id: 'ongoing', 
      label: 'Ongoing', 
      icon: FiNavigation,
      completed: status === 'COMPLETED',
      active: status === 'ONGOING'
    },
    { 
      id: 'completed', 
      label: 'Completed', 
      icon: FiCheckCircle,
      completed: false,
      active: status === 'COMPLETED'
    },
  ];
  
  if (status === 'CANCELLED') {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-error/20 flex items-center justify-center">
            <FiXCircle className="w-6 h-6 text-error" />
          </div>
          <p className="text-error font-medium">Ride Cancelled</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-4">
        <Badge variant={statusConfig.color.toLowerCase()} size="lg">
          {statusConfig.label}
        </Badge>
      </div>
      
      {showProgress && (
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-1 bg-dark-border">
            <div 
              className={cn(
                'h-full bg-primary transition-all duration-500',
                status === 'UPCOMING' && 'w-0',
                status === 'ONGOING' && 'w-1/2',
                status === 'COMPLETED' && 'w-full'
              )}
            />
          </div>
          
          <div className="relative flex justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                    step.completed && 'bg-primary text-white',
                    step.active && 'bg-primary/20 text-primary ring-2 ring-primary',
                    !step.completed && !step.active && 'bg-dark-border text-gray-400'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    'text-xs mt-2 font-medium',
                    (step.completed || step.active) ? 'text-white' : 'text-gray-500'
                  )}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {(source || destination) && (
        <div className="mt-6 p-4 bg-dark-bg/50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <FiMapPin className="w-4 h-4 text-primary" />
              <div className="w-0.5 h-8 bg-dark-border my-1" />
              <FiMapPin className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-gray-400">From</p>
                <p className="text-sm text-white font-medium">{source}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">To</p>
                <p className="text-sm text-white font-medium">{destination}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideStatus;