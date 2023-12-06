import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toastErrorSettings, toastSuccessSettings } from '../../config';
import { trpcFetch } from '../../trpc/trpcFetch';
// import useIsMountedRef from '../../hooks/useIsMountedRef';
import { RhfSubmitButton, RhfTextField, useFormPersistent } from 'mui-components-tezi';
import { T_DevCo_Insert, T_DevCo_Select, devCoInsertZod, devCoSelectZod } from '../../../../api/src/db/schemas';
import useResponsive from '../../hooks/useResponsive';
import { useUrlQueries } from '../../hooks/useUrlQueries';
import { trpc } from '../../trpc/trpc';
import { timeOut } from '../../utils/timeOut';

type inputProps = {
  actionType?: 'add-new' | 'edit'
}

export const AddEditDevCompany = ({actionType}: inputProps) => {
  const isDesktop = useResponsive();
  const urlParams = useParams();
  const queries = useUrlQueries();
  // const isMountedRef = useIsMountedRef();
  actionType = urlParams.actionType === 'edit' ? 'edit' : 'add-new';

  const devCompanyId = queries.get('id');
  const { data: serverData } = (actionType=== 'edit' && devCompanyId) 
    ? trpc.devCompany.getById.useQuery(
        {id: Number(devCompanyId)},
        {
          keepPreviousData: false, 
          refetchOnMount: true,
          // refetchOnWindowFocus: true,
          suspense: true,
        }
      ) 
    : { data: undefined }; 

  const defaultValues: T_DevCo_Insert | T_DevCo_Select = serverData || {
    name: '',
  };

  const {
    FormProvider, ...methods
  } = useFormPersistent<T_DevCo_Insert | T_DevCo_Select>({
    defaultValues,
    resolver: zodResolver(actionType === 'edit' ? devCoSelectZod : devCoInsertZod)
  });

  const {
    handleSubmit,
    // setError
  } = methods;

  const onSubmit = (latestDoc: T_DevCo_Insert | T_DevCo_Select) => {

    console.log(latestDoc);
    const submitAction = actionType === 'edit' 
      ? trpcFetch.devCompany.update.mutate(latestDoc as T_DevCo_Select)
      : trpcFetch.devCompany.create.mutate(latestDoc);

    return Promise.all([timeOut(), submitAction])
      .then(async(values) => {
        const devCompanyObj = values[1];
        // console.log(devCompanyObj);
        toast.success(`${devCompanyObj?.name} ${actionType==='edit' ? 'edited' : 'created'}.`, toastSuccessSettings);
        return devCompanyObj;
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message, toastErrorSettings);
        // if (isMountedRef.current) {
        //   setError(error.message);
        // };
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
      <Typography sx={{ my: 2 }} textAlign='center' variant='h4'>Create Dev Company</Typography>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit, onError)}>
        <RhfTextField
          label='Name'
          name='name'
        />
        <RhfSubmitButton isDesktop={isDesktop} actionType={actionType} />
      </FormProvider>
    </Stack>
  )
}