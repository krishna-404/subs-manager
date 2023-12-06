import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, Typography } from "@mui/material";
import { RhfSubmitButton, RhfTextField, useFormPersistent } from "mui-components-tezi";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { T_Project_Insert, T_Project_Select, projectInsertZod, projectSelectZod } from "../../../../api/src/db/schemas";
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

export const AddEditProject = ({actionType}: inputProps) => {
  const isDesktop = useResponsive();
  const urlParams = useParams();
  const queries = useUrlQueries();
  const devCompanyId = devCompanyCache.getItem()?.id;
  if(!devCompanyId) return <Typography>No Dev Co. Id!</Typography>

  actionType = urlParams.actionType === 'edit' ? 'edit' : 'add-new';

  const projectId = queries.get('id');

  const { data: serverData = undefined } = (actionType === 'edit' && projectId)
    ? trpc.project.getById.useQuery(
      {id: Number(projectId)},
      {
        keepPreviousData: false,
        refetchOnMount: true,
        suspense: true
      }
    )
    : {};
  
  const defaultValues : T_Project_Insert | T_Project_Select = serverData || {
    name: '',
    dev_company_id: devCompanyId,
  };

  const {
    FormProvider, ...methods
  } = useFormPersistent<T_Project_Insert | T_Project_Select>({
    defaultValues,
    resolver: zodResolver(actionType === 'edit' ? projectSelectZod : projectInsertZod)
  });

  const { handleSubmit } = methods;

  const onSubmit = (latestDoc: T_Project_Insert | T_Project_Select) => {
    console.log({latestDoc});

    const submitAction = actionType === 'edit'
      ? trpcFetch.project.update.mutate(latestDoc as T_Project_Select)
      : trpcFetch.project.create.mutate(latestDoc);

    return Promise.all([timeOut(), submitAction])
      .then(async (values) => {
        const projectObj = values[1];
        toast.success(`${projectObj.name} ${actionType==='edit' ? 'edited' : 'created'}.`, toastSuccessSettings);
        return projectObj;
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
      <Typography sx={{ my: 2 }} textAlign='center' variant='h4'>Create Project</Typography>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit, onError)}>
        <RhfTextField
          label='Dev Co. Id'
          name='dev_company_id'
          type='number'
        />
        <RhfTextField 
          label='Project Name'
          name='name'
        />
        <RhfSubmitButton isDesktop={isDesktop} actionType={actionType} />
      </FormProvider>
    </Stack>
  )
};