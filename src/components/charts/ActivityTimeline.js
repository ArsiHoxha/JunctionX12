import React from 'react';

const ActivityTimeline = ({ activities }) => {
  const defaultActivities = [
    {
      id: 1,
      type: 'tender_created',
      title: 'IT Infrastructure Upgrade',
      user: 'John Smith',
      timestamp: '2 hours ago',
      icon: 'document',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      type: 'bid_submitted',
      title: 'Office Furniture Procurement',
      user: 'Tech Solutions Ltd.',
      timestamp: '5 hours ago',
      icon: 'inbox',
      color: 'bg-green-500'
    },
    {
      id: 3,
      type: 'tender_deadline_extended',
      title: 'Marketing Campaign Services',
      user: 'Marketing Team',
      timestamp: '1 day ago',
      icon: 'clock',
      color: 'bg-amber-500'
    },
    {
      id: 4,
      type: 'contract_awarded',
      title: 'Security System Upgrade',
      user: 'Sarah Johnson',
      timestamp: '2 days ago',
      icon: 'check-circle',
      color: 'bg-purple-500'
    },
    {
      id: 5,
      type: 'tender_closed',
      title: 'Office Supplies Contract',
      user: 'Procurement Team',
      timestamp: '1 week ago',
      icon: 'x-circle',
      color: 'bg-red-500'
    }
  ];

  const data = activities || defaultActivities;

  // Function to select the appropriate icon
  const getIcon = (iconType) => {
    switch(iconType) {
      case 'document':
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'inbox':
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        );
      case 'clock':
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'check-circle':
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'x-circle':
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Function to get the status text
  const getStatusText = (type) => {
    switch(type) {
      case 'tender_created':
        return 'created a new tender';
      case 'bid_submitted':
        return 'submitted a bid for';
      case 'tender_deadline_extended':
        return 'extended the deadline for';
      case 'contract_awarded':
        return 'awarded a contract for';
      case 'tender_closed':
        return 'closed the tender for';
      default:
        return 'updated';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40 p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h3>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {data.map((activity, index) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {index !== data.length - 1 && (
                  <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                )}
                <div className="relative flex items-start space-x-3">
                  <div>
                    <div className={`${activity.color} h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800`}>
                      {getIcon(activity.icon)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <a href="#" className="font-medium text-gray-900 dark:text-white">{activity.user}</a>
                        <span className="text-gray-500 dark:text-gray-400"> {getStatusText(activity.type)} </span>
                        <a href="#" className="font-medium text-gray-900 dark:text-white">{activity.title}</a>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{activity.timestamp}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-6 text-center">
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          View all activity
        </button>
      </div>
    </div>
  );
};

export default ActivityTimeline; 