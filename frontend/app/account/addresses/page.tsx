import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';

export default function AddressesPage() {
  const addresses = [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold">My Addresses</h1>
          <div className="flex gap-2">
            <Button className="text-xs h-8 px-3" style={{ backgroundColor: '#B76E79' }}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Address
            </Button>
            <Link href="/account">
              <Button variant="outline" className="text-xs h-8 px-3">Back</Button>
            </Link>
          </div>
        </div>

        {addresses.length === 0 ? (
          <Card className="p-6 sm:p-12 text-center">
            <MapPin className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No addresses saved</h3>
            <p className="text-gray-600 text-sm mb-5">Add an address for faster checkout</p>
            <Button className="text-xs h-9" style={{ backgroundColor: '#B76E79' }}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Address
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address Card Example */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                    Default
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <h4 className="font-semibold mb-2">John Doe</h4>
              <p className="text-sm text-gray-600">
                123 Main Street, Apartment 4B<br />
                New York, NY 10001<br />
                Phone: +1 234 567 8900
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
