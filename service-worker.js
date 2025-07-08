
const CACHE_NAME = 'officemate-pro-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx',
  // Key JS/TSX files
  '/App.tsx',
  '/types.ts',
  '/constants.tsx',
  '/components/Layout.tsx',
  '/components/ui/Button.tsx',
  '/components/ui/Card.tsx',
  '/components/ui/Input.tsx',
  '/components/ui/Modal.tsx',
  '/components/ui/Select.tsx',
  '/components/ui/Spinner.tsx',
  '/components/ui/Table.tsx',
  '/contexts/AuthContext.tsx',
  '/features/auth/LoginPage.tsx',
  '/features/dashboard/DashboardPage.tsx',
  '/features/employee/EmployeePage.tsx',
  '/features/inventory/InventoryPage.tsx',
  '/features/inventory/ItInventoryPage.tsx',
  '/features/po/PurchaseOrderPage.tsx',
  '/features/documents/DocumentPage.tsx',
  '/features/chat/ChatPage.tsx',
  '/features/calendar/CalendarPage.tsx',
  '/features/reports/ReportPage.tsx',
  '/features/admin/UserManagementPage.tsx',
  '/features/admin/FingerprintScannerSettingsPage.tsx',
  '/features/admin/AnnouncementSettingsModal.tsx',
  '/features/leave/LeaveManagementPage.tsx',
  '/features/idcard/EmployeeIdCardPage.tsx',
  '/features/idcard/IdCardPreview.tsx',
  '/features/cash-advance/CashAdvancePage.tsx',
  '/features/payroll/PayrollPage.tsx',
  '/features/payroll/PayrollRunDetailsPage.tsx',
  '/features/payroll/PayrollSettingsPage.tsx',
  '/features/payroll/EditPayslipModal.tsx',
  '/features/payroll/PayslipView.tsx',
  '/features/documents/DocumentView.tsx',
  '/services/mockData.ts',
  '/services/notificationService.ts',
  '/utils/export.ts',
  // External assets
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react-dom@^19.1.0/',
  'https://esm.sh/react@^19.1.0/',
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-router-dom@^7.6.2',
  'https://esm.sh/recharts@^2.15.3',
  'https://esm.sh/@google/genai',
  // Placeholder for images
  '/logo192.png',
  '/logo512.png',
  '/logo-placeholder.png'
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use addAll for atomic operation, but handle potential individual failures gracefully
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.warn('Failed to cache:', url, error);
            });
          })
        );
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200) {
              return response;
            }
            // Don't cache non-GET requests
            if(event.request.method !== 'GET') {
                return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});


self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
