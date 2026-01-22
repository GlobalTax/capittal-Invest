import { ReactNode } from 'react';
import { InvestorSidebar } from './InvestorSidebar';
import { InvestorHeader } from './InvestorHeader';

interface InvestorLayoutProps {
  children: ReactNode;
}

export const InvestorLayout = ({ children }: InvestorLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex">
      <InvestorSidebar />
      <div className="flex-1 flex flex-col">
        <InvestorHeader />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
