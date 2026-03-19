declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
  }
  
  export type Icon = FC<IconProps>;
  
  // Shopping & Cart
  export const ShoppingCart: Icon;
  export const Heart: Icon;
  export const Star: Icon;
  export const Package: Icon;
  export const Truck: Icon;
  
  // User & Account
  export const User: Icon;
  export const Settings: Icon;
  export const LogOut: Icon;
  export const Eye: Icon;
  export const EyeOff: Icon;
  
  // Navigation
  export const Search: Icon;
  export const Menu: Icon;
  export const X: Icon;
  export const Home: Icon;
  export const ChevronDown: Icon;
  export const ChevronUp: Icon;
  export const ChevronLeft: Icon;
  export const ChevronRight: Icon;
  
  // Actions
  export const Plus: Icon;
  export const Minus: Icon;
  export const Edit: Icon;
  export const Trash: Icon;
  export const Trash2: Icon;
  export const Check: Icon;
  export const CheckCircle: Icon;
  export const RefreshCw: Icon;
  export const Upload: Icon;
  export const Download: Icon;
  
  // Communication
  export const Mail: Icon;
  export const Phone: Icon;
  export const MapPin: Icon;
  export const Bell: Icon;
  
  // UI Elements
  export const SlidersHorizontal: Icon;
  export const LayoutGrid: Icon;
  export const SortAsc: Icon;
  export const SortDesc: Icon;
  export const Grid: Icon;
  export const List: Icon;
  export const MoreVertical: Icon;
  export const MoreHorizontal: Icon;
  export const Image: Icon;
  export const FileText: Icon;
  export const File: Icon;
  
  // Status & Info
  export const AlertCircle: Icon;
  export const Info: Icon;
  export const CreditCard: Icon;
  export const CheckCircle: Icon;
  export const CheckCircle2: Icon;
  export const XCircle: Icon;
  
  // Share & Links
  export const Share: Icon;
  export const Share2: Icon;
  export const ExternalLink: Icon;
  export const Link: Icon;
  export const Copy: Icon;
  export const Lock: Icon;
  export const Shield: Icon;
  export const Tag: Icon;
  export const RotateCcw: Icon;
  export const Package: Icon;
  
  // Social Media
  export const Facebook: Icon;
  export const Twitter: Icon;
  export const Instagram: Icon;
  export const Youtube: Icon;
}
