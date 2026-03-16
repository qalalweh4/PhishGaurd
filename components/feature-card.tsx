import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon, iconBg, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 text-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all h-full">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white ${iconBg}`}
      >
        {icon}
      </div>
      <h6 className="font-bold mb-1">{title}</h6>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
