'use client';

import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface TableProps {
  headers: Array<{
    key: string;
    label: string;
    cellClassName?: string | ((value: string | number | React.ReactNode) => string);
  }>;
  data: Array<Record<string, string | number | React.ReactNode>>;
  emptyContentMessage?: string;
  isLoading?: boolean;
  showRowNumber?: boolean;
  offset?: number;
}

const Table: React.FC<TableProps> = ({
  headers,
  showRowNumber,
  offset,
  data,
  emptyContentMessage = 'موجود نیست!',
  isLoading = false,
}) => {
  const colSpan = headers.length + (showRowNumber ? 1 : 0);

  return (
    <div className="overflow-hidden overflow-y-auto w-full  rounded-xl">
      <ShadcnTable>
        <TableHeader className="sticky top-0 z-1">
          <TableRow className="text-center text-xs xl:text-sm font-semibold ">
            {showRowNumber && (
              <TableHead className="text-center text-primary-foreground">#</TableHead>
            )}

            {headers.map((header) => (
              <TableHead key={header.key} className="text-center text-primary font-semibold">
                {header.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody className="text-foreground font-normal text-xs xl:text-sm">
          {isLoading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={colSpan} className="text-center py-8">
                <Loader2 className="mx-auto size-5 animate-spin text-primary" />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={colSpan} className="text-center py-8">
                <p className="text-sm">{emptyContentMessage}</p>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={row.id as React.Key} className="text-center ">
                {showRowNumber && (
                  <TableCell className="text-center">{(offset ?? 0) + index + 1}</TableCell>
                )}
                {headers.map((header) => {
                  const value = row[header.key];
                  const resolvedClassName =
                    typeof header.cellClassName === 'function'
                      ? header.cellClassName(value)
                      : header.cellClassName;

                  return (
                    <TableCell key={header.key} className={cn('text-center', resolvedClassName)}>
                      {value || '-'}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </ShadcnTable>
    </div>
  );
};

export default Table;
