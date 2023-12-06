import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, Typography } from "@mui/material";
import { RhfSubmitButton, RhfTextField, useFormPersistent } from "mui-components-tezi";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { T_Og_Insert, T_Og_Select, ogInsertZod, ogSelectZod } from "../../../../api/src/db/schemas";
import { toastErrorSettings, toastSuccessSettings } from "../../config";
import useResponsive from "../../hooks/useResponsive";
import { useUrlQueries } from "../../hooks/useUrlQueries";
import { trpc } from "../../trpc/trpc";
import { trpcFetch } from "../../trpc/trpcFetch";
import { devCompanyCache } from "../../utils/localCacheApi";
import { timeOut } from "../../utils/timeOut";

type inputProps = {
  actionType?: 'add-new' | 'edit'
};

export const AddEditOg = ({actionType}: inputProps) => {
  const isDesktop = useResponsive();
  const urlParams = useParams();

  const queries = useUrlQueries();
  const devCompanyId =  queries.get('devCoId') || devCompanyCache.getItem()?.id;
  const ogId = queries.get('id');

  actionType = urlParams.actionType === 'edit' ? 'edit' : 'add-new';

  const { data: serverData = undefined } = (actionType === 'edit' && devCompanyId && ogId)
    ? trpc.og.getById.useQuery(
      {dev_company_id: Number(devCompanyId), id: Number(ogId)},
      {
        keepPreviousData: false,
        refetchOnMount: true,
        suspense: true
      }
    )
    : {};
  
  const { data } = trpc.og.getMaxOgId.useQuery(
    {dev_company_id: Number(devCompanyId)},
    {
      keepPreviousData: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      suspense: true
    }
  );

  const maxOgId = data?.maxOgId || 0;
  
  const defaultValues: T_Og_Insert | T_Og_Select = serverData || {
    dev_company_id: Number(devCompanyId),
    email: '',
    id: (maxOgId + 1),
    name: '',
  };

  const {
    FormProvider, ...methods
  } = useFormPersistent<T_Og_Insert | T_Og_Select>({
    defaultValues,
    resolver: zodResolver(actionType === 'edit' ? ogSelectZod : ogInsertZod)
  });

  const { handleSubmit } = methods;

  const onSubmit = (latestDoc: T_Og_Insert | T_Og_Select) => {
    console.log({latestDoc});

    const submitAction = actionType === 'edit'
      ? trpcFetch.og.update.mutate(latestDoc as T_Og_Select)
      : trpcFetch.og.create.mutate(latestDoc)

    return Promise.all([timeOut(), submitAction])
      .then(async (values) => {
        const ogObj = values[1];
        toast.success(`${ogObj.name} ${actionType==='edit' ? 'edited' : 'created'}.`, toastSuccessSettings);
        return ogObj;
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message, toastErrorSettings);
        return error;
      });
  };

  const onError = (error: any) => {
    console.error(error);
  };

  return (
    <Stack
      minWidth={300}
      maxWidth={400}
    >
      <Typography sx={{ my: 2 }} textAlign='center' variant='h4'>Create Owner Group</Typography>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit, onError)}>
        <RhfTextField
          label='Dev Co. Id'
          name='dev_company_id'
          type='number'
        />
        <RhfTextField
          label='Owner Group Id'
          name='id'
          type='number'
        />
        <RhfTextField 
          label='Owner Group Name'
          name='name'
        />
        <RhfSubmitButton isDesktop={isDesktop} actionType={actionType} />
      </FormProvider>
    </Stack>
  )
}