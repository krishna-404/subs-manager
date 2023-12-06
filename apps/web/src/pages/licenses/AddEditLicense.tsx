import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, Typography } from "@mui/material";
import { format } from "date-fns";
import { AutoCompleteStringNumberRhfMui, DatePickerRhfMui, RhfSubmitButton, RhfTextField, useFormPersistent } from "mui-components-tezi";
import { Control, useWatch } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';
import { T_License_Insert, T_License_Select, licenseInsertZod, licenseSelectZod } from "../../../../api/src/db/schemas";
import { toastSuccessSettings } from "../../config";
import useResponsive from "../../hooks/useResponsive";
import { useUrlQueries } from "../../hooks/useUrlQueries";
import { trpc } from "../../trpc/trpc";
import { trpcFetch } from "../../trpc/trpcFetch";
import { formSubmitErrorHandler } from "../../utils/formSubmitErrorHandler";
import { devCompanyCache } from "../../utils/localCacheApi";
import { timeOut } from "../../utils/timeOut";

type inputProps = {
  actionType?: 'add-new' | 'edit'
};

export const AddEditLicense = ({actionType}: inputProps) => {
  const isDesktop = useResponsive();
  const urlParams = useParams();
  const queries = useUrlQueries();
  const devCompanyId =  queries.get('devCoId') || devCompanyCache.getItem()?.id;
  const licenseId = queries.get('id');

  actionType = urlParams.actionType === 'edit' ? 'edit' : 'add-new';

  const { data: serverData = undefined } = (actionType === 'edit' && devCompanyId && licenseId)
    ? trpc.license.getById.useQuery(
      {id: licenseId},
      {
        keepPreviousData: false,
        refetchOnMount: true,
        suspense: true
      }
    )
    : {};

  const defaultValues = serverData || {
    dev_company_id: Number(devCompanyId),
    id: uuidv4(),
    start_date: format(new Date(), 'yyyy-MM-dd')
  };

  const {
    FormProvider, ...methods
  } = useFormPersistent<T_License_Insert | T_License_Select>({
    defaultValues,
    resolver: zodResolver(actionType === 'edit' ? licenseSelectZod : licenseInsertZod)
  });

  const { control, handleSubmit, setError } = methods;

  const onSubmit = (latestDoc: T_License_Insert | T_License_Select) => {
    console.log({latestDoc});

    const submitAction = actionType === 'edit'
      ? trpcFetch.license.update.mutate(latestDoc as T_License_Select)
      : trpcFetch.license.create.mutate(latestDoc)

    return Promise.all([timeOut(), submitAction])
      .then(async (values) => {
        const licenseObj = values[1];
        toast.success(`${licenseObj.id} ${actionType==='edit' ? 'edited' : 'created'}.`, toastSuccessSettings);
        return licenseObj;
      })
      .catch(formSubmitErrorHandler(setError));
  };

  const onError = (error: any) => {
    console.error(error);
  };

  return (
    <Stack
      minWidth={300}
      maxWidth={400}
    >
      <Typography sx={{ my: 2 }} textAlign='center' variant='h4'>Create License</Typography>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit, onError)}>
        <RhfTextField
          label='License no.'
          name='id'
          disabled
        />
        <AutoCompleteStringNumberRhfMui
          disableClearable={true}
          getOptionLabel={(option: any) => typeof option !== 'object' ? option.toString() : `${option.id} - ${option.name}`}
          objectValueKey='id'
          label='Dev Co. Id'
          name='dev_company_id'
          queryFn={trpcFetch.devCompany.getList.query()}
        />
        <AutoCompleteStringNumberRhfMui
          disableClearable={true}
          getOptionLabel={(option: any) => typeof option !== 'object' ? option.toString() : `${option.id} - ${option.name}`}
          objectValueKey='id'
          label='Project Id'
          name='project_id'
          queryFn={trpcFetch.project.getList.query()}
        />
        <AutoCompleteStringNumberRhfMui
          disableClearable={true}
          getOptionLabel={(option: any) => typeof option !== 'object' ? option.toString() : `${option.id} - ${option.name}`}
          objectValueKey='id'
          label='Owner Group Id'
          name='og_id'
          queryFn={trpcFetch.og.getList.query()}
        />
        <RhfTextField 
          label='Email'
          name='email'
          type='email'
        />
        <RhfTextField
          label='Mobile Number'
          name='mobile_number'
        />
        <DatePickerRhfMui
          label='Start Date'
          name='start_date'
        />
        <EndDateEl control={control} />
        <RhfSubmitButton isDesktop={isDesktop} actionType={actionType} />
      </FormProvider>
    </Stack>
  )
};

type EndDateT = {
  control: Control<T_License_Insert | T_License_Select>
}

const EndDateEl = ({ control }:EndDateT) => {

  const startDate = useWatch({
    control,
    name: 'start_date'
  });

  return (
    <DatePickerRhfMui
      label='End Date'
      minDate={startDate ? new Date(startDate): new Date()}
      name='end_date'
    />
  )
}