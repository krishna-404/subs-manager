import { MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import { useMemo } from "react";
import { T_License_Select } from "../../../../api/src/db/schemas";
import { trpc } from "../../trpc/trpc";

export const LicenseList = () => {
  const { data: serverData } = trpc.license.getList.useQuery(undefined, {
    keepPreviousData: true,
    refetchOnMount: true,
    // networkMode: 'always'
  });

  const columns: MRT_ColumnDef<T_License_Select>[] = useMemo(() => [
    {
      accessorKey: 'dev_company_id',
      header: 'Dev. Co. Id'
    },
    {
      accessorKey: 'project_id',
      header: 'Project Id'
    },
    {
      accessorKey: 'og_id',
      header: 'OG Id'
    },
    {
      accessorKey: 'id',
      header: 'License Id'
    },
    {
      accessorKey: 'email',
      header: 'Email'
    },
    {
      accessorKey: 'mobile_number',
      header: 'Mobile No.'
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date'
    },
    {
      accessorKey: 'end_date',
      header: 'End Date'
    },
    {
      accessorKey: 'status',
      header: 'Status'
    },
    {
      accessorKey: 'created_at',
      header: 'Created At'
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated At'
    }
  ], []);

  return (
    <MaterialReactTable
      columns={columns}
      data={serverData ?? []}
      // enableRowActions
    />
  )
};