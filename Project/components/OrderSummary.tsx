import React from 'react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';

type OrderItemType = {
  id: number;
  quantity: number;
  price: number;
  productId: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
};

type OrderProps = {
  order: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    totalAmount: number;
    status: string;
    items: OrderItemType[];
    user: {
      id: number;
      email: string;
      name?: string | null;
    };
  };
};

const OrderSummary: React.FC<OrderProps> = ({ order }) => {
  const { items, totalAmount, status, createdAt } = order;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Order Summary</h2>
        <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">
          {status}
        </span>
      </div>

      <div className="text-sm text-gray-500 mb-6">
        Placed on {new Date(createdAt).toLocaleDateString()}
      </div>

      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="py-4 flex items-start">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
              {item.product.image && (
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover object-center"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <h3>{item.product.name}</h3>
                <p className="ml-4">{formatCurrency(item.price)}</p>
              </div>
              <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <p>Total</p>
          <p>{formatCurrency(totalAmount)}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
