import { MenuItem } from "@mui/material";
import { MRT_ColumnDef, MRT_TableOptions, MaterialReactTable } from 'material-react-table';
import { DeleteButton } from "mui-components-tezi";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { T_DevCo_Select } from "../../../../api/src/db/schemas";
import { InternalLink } from "../../components/InternalLink";
import { toastSuccessSettings } from "../../config";
import { trpc } from "../../trpc/trpc";
import { trpcFetch } from "../../trpc/trpcFetch";

export const DevCompaniesList = () => {
  
  const {data: serverData, isLoading, isError, isFetched , failureReason, isPaused, refetch} = trpc.devCompany.getList.useQuery(undefined, {
    keepPreviousData: true,
    refetchOnMount: true,
    // networkMode: 'always'
  });
  const navigate = useNavigate();

  const columns: MRT_ColumnDef<T_DevCo_Select>[] = useMemo(() => [
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
  
  const renderRowActionMenuItems: MRT_TableOptions<T_DevCo_Select>['renderRowActionMenuItems'] = (props) => ([
    
      <InternalLink
        title="Edit Dev Company"
        to={`/devCompany/edit?id=${props.row.original.id}`}
      >
        <MenuItem>
          Edit
        </MenuItem>
      </InternalLink>,
    <DeleteButton
      dialogTitle='Delete Dev Company'
      deleteFunction={
        () => trpcFetch.devCompany.delete.mutate({id: props.row.original.id})
          .then((deletedDevCompany) => {
            refetch();
            toast.success(`Dev Company ${deletedDevCompany.name}(id: ${deletedDevCompany.id}) deleted succesfully.`, toastSuccessSettings)
          })
      }
    />
  ]);

  return (
    <MaterialReactTable
      columns={columns}
      data={serverData ?? []}
      enableRowActions
      renderRowActionMenuItems = {renderRowActionMenuItems}
    />
  )
}