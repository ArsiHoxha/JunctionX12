import React from 'react';

const SupplierMap = () => {
  // In a real application, this would use a proper mapping library like react-leaflet or react-map-gl
  // For this demo, we'll create a simplified visual representation of a map
  
  // Sample data - supplier distribution by region
  const regions = [
    { id: 1, name: 'North', suppliers: 24, color: 'bg-blue-500', percentage: 40 },
    { id: 2, name: 'South', suppliers: 18, color: 'bg-green-500', percentage: 30 },
    { id: 3, name: 'East', suppliers: 12, color: 'bg-amber-500', percentage: 20 },
    { id: 4, name: 'West', suppliers: 6, color: 'bg-purple-500', percentage: 10 }
  ];
  
  // Calculate total suppliers
  const totalSuppliers = regions.reduce((sum, region) => sum + region.suppliers, 0);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40 p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Supplier Distribution</h3>
      
      <div className="flex flex-col space-y-6">
        {/* Simplified map visualization */}
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg relative overflow-hidden">
          {/* This is a simplified map representation */}
          <div className="absolute inset-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 flex">
            <div className="flex-1 border-r-2 border-gray-300 dark:border-gray-600 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 opacity-30 dark:opacity-50"></div>
              <span className="text-xl font-bold text-gray-700 dark:text-gray-200">N</span>
              <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">24</div>
            </div>
            <div className="flex-1 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-purple-100 dark:bg-purple-900/30 opacity-30 dark:opacity-50"></div>
              <span className="text-xl font-bold text-gray-700 dark:text-gray-200">W</span>
              <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">6</div>
            </div>
          </div>
          <div className="absolute inset-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="flex h-full">
              <div className="flex-1 border-r-2 border-gray-300 dark:border-gray-600 flex flex-col">
                <div className="flex-1"></div>
                <div className="flex-1 border-t-2 border-gray-300 dark:border-gray-600 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 opacity-30 dark:opacity-50"></div>
                  <span className="text-xl font-bold text-gray-700 dark:text-gray-200">S</span>
                  <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">18</div>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex-1"></div>
                <div className="flex-1 border-t-2 border-gray-300 dark:border-gray-600 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-amber-100 dark:bg-amber-900/30 opacity-30 dark:opacity-50"></div>
                  <span className="text-xl font-bold text-gray-700 dark:text-gray-200">E</span>
                  <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">12</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Region breakdown */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Regional Breakdown</h4>
          <div className="space-y-3">
            {regions.map((region) => (
              <div key={region.id} className="flex items-center">
                <div className={`h-3 w-3 rounded-full ${region.color} mr-2`}></div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{region.name}</span>
                    <span className="text-gray-600 dark:text-gray-400">{region.suppliers} suppliers ({Math.round(region.suppliers / totalSuppliers * 100)}%)</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${region.color}`} style={{ width: `${region.percentage}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierMap; 