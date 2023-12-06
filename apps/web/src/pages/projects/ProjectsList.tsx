import { MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import { useMemo } from "react";
import { T_Project_Select } from "../../../../api/src/db/schemas";
import { trpc } from "../../trpc/trpc";

export const ProjectsList = () => {
  const { data: serverData } = trpc.project.getList.useQuery(undefined, {
    keepPreviousData: true,
    refetchOnMount: true,
    // networkMode: 'always'
  });
  console.log({serverData});

  const columns: MRT_ColumnDef<T_Project_Select>[] = useMemo(() => [
    {
      accessorKey: 'dev_company_id',
      header: 'Dev. Co. Id'
    },
    {
      accessorKey: 'id',
      header: 'Id'
    },
    {
      accessorKey: 'name',
      header: 'Name'
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
  );
};