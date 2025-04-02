import React from 'react';

interface TableHeader {
  key: string;
  label: string;
  className?: string;
  render?: (item: any) => React.ReactNode;
}

interface TableDisplayProps {
  headers: TableHeader[];
  data: any[];
  emptyMessage?: string | React.ReactNode;
  maxHeight?: string;
  onRowClick?: (item: any) => void;
  actions?: (item: any) => React.ReactNode;
  rowClassName?: (item: any, index: number) => string;
  loading?: boolean; 
}

export const TableDisplay: React.FC<TableDisplayProps> = ({
  headers,
  data,
  emptyMessage = 'ไม่พบข้อมูล',
  maxHeight = '400px',
  onRowClick,
  actions,
  rowClassName,
  loading = false, 
}) => {
  const renderLoadingState = () => (
    <tr>
      <td
        colSpan={headers.length + (actions ? 1 : 0)}
        className="px-4 py-8 text-center"
      >
        <div className="flex flex-col items-center justify-center">
            <div className="flex h-full items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-secondary border-t-transparent"></div>
            </div>
            <div className="text-base">กำลังโหลดข้อมูล...</div>
          </div>
      </td>
    </tr>
  );

  return (
    <div className="w-full overflow-hidden border border-gray-200 rounded">
      <div
        className="overflow-x-auto"
        style={{ maxHeight: maxHeight }}
        {...(maxHeight ? { 'data-scrollable': 'true' } : {})}
      >
        <table className="min-w-full relative">
          {/* Table Header */}
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  className={`
                    px-4 py-3 
                    text-left text-xs 
                    font-medium text-header
                    uppercase 
                    sticky top-0 
                    bg-gray-50 
                    ${header.className || ''}
                  `}
                >
                  {header.label}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-center text-xs font-medium text-header uppercase sticky top-0 bg-gray-50">
                  จัดการ
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // แสดง loading spinner ถ้า loading เป็น true
              renderLoadingState()
            ) : data.length === 0 ? (
              // แสดงข้อความเมื่อไม่มีข้อมูล
              <tr>
                <td
                  colSpan={headers.length + (actions ? 1 : 0)}
                  className="px-4 py-4 text-center text-mediumGray"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.id || index}
                  className={`
                    text-header
                    hover:bg-gray-50 
                    transition-colors 
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${rowClassName ? rowClassName(item, index) : ''}
                  `}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {headers.map((header) => (
                    <td
                      key={header.key}
                      className={`
                        text-header
                        px-4 py-4 text-sm
                        ${header.className || ''}
                      `}
                    >
                      {header.render ? header.render(item) : item[header.key] ?? '-'}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-4 text-center text-header">
                      <div className="flex justify-center space-x-2">
                        {actions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};