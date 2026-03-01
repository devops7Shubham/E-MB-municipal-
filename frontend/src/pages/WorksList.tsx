import React from 'react';
import { Link } from 'react-router-dom';
import { useWorks } from '@/hooks/useWorks';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/Table';
import { Card, CardContent } from '@/components/ui/Card';

export function WorksList() {
  const { data: works, isLoading, error } = useWorks();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-48" />
        <Card>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Failed to load works: {(error as { message?: string })?.message || 'Unknown error'}
            </p>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800">Works List</h2>
        <p className="text-slate-500 text-sm">
          {works?.length || 0} work(s) found
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Work Name</TableHeaderCell>
                <TableHeaderCell>Contractor</TableHeaderCell>
                <TableHeaderCell>Agreement No.</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {works && works.length > 0 ? (
                works.map((work) => (
                  <TableRow key={work.id}>
                    <TableCell className="font-mono text-slate-500">
                      #{work.id}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {work.name}
                    </TableCell>
                    <TableCell>{work.contractor}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {work.agreement_number}
                    </TableCell>
                    <TableCell>
                      <Badge status={work.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/works/${work.id}`}>
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No works found. Please ensure the backend has seeded data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default WorksList;