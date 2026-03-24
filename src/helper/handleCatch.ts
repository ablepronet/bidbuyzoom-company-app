import AppToast from '../components/toaster';

const HandleApiCatch = (error: any, fun?: string) => {
  console.log(
    'HandleApiCatch in--->',
    fun ?? '',
    error?.response?.data?.message || error.code,
  );
  AppToast.error(
    error?.response?.data?.message  ||
      error.code ||
      'Something went wrong please try after sometime',
  );
};

export default HandleApiCatch;
