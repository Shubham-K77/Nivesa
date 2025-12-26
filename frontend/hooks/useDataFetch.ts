import { useState, useEffect } from "react";
import { toast } from "sonner";
const useDataFetch = <T = any>(
  fetchFunction: () => any,
  dataKey?: string,
  dependencies: any[] = []
) => {
  //Data Utilized:
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  //UseFetch Hook:
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchFunction();
        const extractedData = dataKey
          ? response?.data?.[dataKey]
          : response?.data;
        setData(extractedData);
      } catch (error: any) {
        console.error(error);
        return toast.error(error?.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };
    //Call Function
    fetchData();
  }, [refetchTrigger, ...dependencies]);
  //Trigger Function
  const refetch = () => setRefetchTrigger((prev) => prev + 1);
  //Return The Functions
  return { data, loading, refetch };
};

export default useDataFetch;
